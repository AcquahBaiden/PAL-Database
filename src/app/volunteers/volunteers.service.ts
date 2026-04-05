import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  setDoc,
  where
} from '@angular/fire/firestore';
import { Storage, getDownloadURL, ref as storageRef } from '@angular/fire/storage';
import { uploadBytesResumable } from 'firebase/storage';

import { Volunteer } from '../interfaces/volunteer.interface';
import { ProfileVersion } from '../interfaces/profile-history.interface';
import { NotificationService } from '../notification/notification.service';
import { compareByName, observeCollectionData, observeDocumentData, toFirestorePlainData } from '../shared/firestore-data.utils';

@Injectable({
  providedIn: 'root',
})
export class VolunteersService {
  public uploadPercent: Observable<number | undefined>;
  public downloadURL!: Observable<string>;

  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private auth = inject(Auth);
  private notiService = inject(NotificationService);

  private readonly volunteersCollection = collection(this.firestore, 'volunteers');
  private readonly activeVolunteersQuery = query(this.volunteersCollection, where('archived', '==', false));
  private readonly archivedVolunteersQuery = query(this.volunteersCollection, where('archived', '==', true));
  private readonly volunteersStream = observeCollectionData<Volunteer>(this.activeVolunteersQuery, { idField: 'id' }).pipe(
    map((volunteers) => volunteers.sort(compareByName))
  );
  private readonly archivedVolunteersStream = observeCollectionData<Volunteer>(this.archivedVolunteersQuery, { idField: 'id' }).pipe(
    map((volunteers) => volunteers.sort((left, right) => (right.archivedAt || 0) - (left.archivedAt || 0)))
  );

  getVolunteersData(): Observable<Volunteer[]> {
    return this.volunteersStream;
  }

  getArchivedVolunteers(): Observable<Volunteer[]> {
    return this.archivedVolunteersStream;
  }

  getVolunteer(id: string): Observable<Volunteer> {
    return observeDocumentData<Volunteer>(doc(this.firestore, 'volunteers', id), { idField: 'id' }) as Observable<Volunteer>;
  }

  getVolunteerProfileHistory(id: string): Observable<ProfileVersion<Volunteer>[]> {
    return observeCollectionData<ProfileVersion<Volunteer>>(
      query(collection(this.firestore, 'volunteers', id, 'history'), orderBy('timestamp', 'desc')),
      { idField: 'id' }
    );
  }

  async saveToDB(data: Volunteer): Promise<boolean> {
    try {
      const timestamp = Date.now();
      await addDoc(this.volunteersCollection, this.buildVolunteerRecord({
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        archived: false
      }));

      this.notiService.setState(false, `${data.firstName} successfully saved`, true);
      return true;
    } catch (error) {
      console.error('Error saving volunteer:', error);
      this.notiService.setState(true, 'Something went wrong when saving profile', true);
      return false;
    }
  }

  async uploadFile(event: any, fileName: string): Promise<string> {
    const file = event.target.files[0];
    if (!file) {
      throw new Error('No file selected');
    }

    const fileRef = storageRef(this.storage, 'volunteers/' + fileName);
    const task = uploadBytesResumable(fileRef, file);

    this.uploadPercent = new Observable<number | undefined>((subscriber) => {
      task.on(
        'state_changed',
        (snapshot) => subscriber.next((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => subscriber.error(error),
        () => subscriber.complete()
      );
    });

    await task;

    const url = await getDownloadURL(fileRef);
    this.downloadURL = new Observable((subscriber) => {
      subscriber.next(url);
      subscriber.complete();
    });

    return url;
  }

  async deleteVolunteer(id: string) {
    try {
      await deleteDoc(doc(this.firestore, 'volunteers', id));
      this.notiService.setState(false, 'Profile successfully deleted', true);
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      this.notiService.setState(true, 'Something went wrong when deleting profile', true);
    }
  }

  async updateVolunteer(id: string, editedVolunteer: Partial<Volunteer>) {
    try {
      const currentVolunteer = await this.getVolunteerSnapshot(id);
      if (!currentVolunteer) {
        throw new Error('Volunteer profile not found');
      }

      const timestamp = Date.now();
      const versionId = await this.saveHistorySnapshot(id, currentVolunteer, timestamp);
      await setDoc(doc(this.firestore, 'volunteers', id), this.buildVolunteerRecord({
        ...currentVolunteer,
        ...editedVolunteer,
        createdAt: currentVolunteer.createdAt || currentVolunteer.updatedAt || timestamp,
        updatedAt: timestamp,
        latestVersionId: versionId
      }));

      this.notiService.setState(false, 'Profile successfully updated', true);
    } catch (error) {
      console.error('Error updating volunteer:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
      throw error;
    }
  }

  async updateVolunteerProfilePhoto(id: string, fileName: string) {
    try {
      const currentVolunteer = await this.getVolunteerSnapshot(id);
      if (!currentVolunteer) {
        throw new Error('Volunteer profile not found');
      }

      const timestamp = Date.now();
      const versionId = await this.saveHistorySnapshot(id, currentVolunteer, timestamp);
      await setDoc(doc(this.firestore, 'volunteers', id), this.buildVolunteerRecord({
        ...currentVolunteer,
        img: fileName,
        createdAt: currentVolunteer.createdAt || currentVolunteer.updatedAt || timestamp,
        updatedAt: timestamp,
        latestVersionId: versionId
      }));

      this.notiService.setState(false, 'Profile photo successfully updated', true);
      return true;
    } catch (error) {
      console.error('Error updating volunteer photo:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile photo', true);
      return false;
    }
  }

  async archiveVolunteer(id: string, reason: string, reasonDetail?: string) {
    try {
      const currentVolunteer = await this.getVolunteerSnapshot(id);
      if (!currentVolunteer) {
        throw new Error('Volunteer profile not found');
      }

      const timestamp = Date.now();
      const versionId = await this.saveHistorySnapshot(id, currentVolunteer, timestamp);
      await setDoc(doc(this.firestore, 'volunteers', id), this.buildVolunteerRecord({
        ...currentVolunteer,
        archived: true,
        archivedAt: timestamp,
        archivedReason: reason,
        archivedReasonDetail: reasonDetail?.trim() || null,
        archivedBy: this.auth.currentUser?.email || null,
        updatedAt: timestamp,
        latestVersionId: versionId
      }));

      this.notiService.setState(false, 'Profile successfully archived', true);
    } catch (error) {
      console.error('Error archiving volunteer:', error);
      this.notiService.setState(true, 'Something went wrong when archiving profile', true);
      throw error;
    }
  }

  private async getVolunteerSnapshot(id: string): Promise<Volunteer | null> {
    const snapshot = await getDoc(doc(this.firestore, 'volunteers', id));
    if (!snapshot.exists()) {
      return null;
    }

    return {
      ...(snapshot.data() as Volunteer),
      id: snapshot.id
    };
  }

  private async saveHistorySnapshot(id: string, volunteer: Volunteer, timestamp: number): Promise<string> {
    const versionId = `${timestamp}-${Math.random().toString(36).slice(2, 10)}`;
    await setDoc(doc(this.firestore, 'volunteers', id, 'history', versionId), toFirestorePlainData({
      timestamp,
      profile: this.buildVolunteerRecord(volunteer)
    }));

    return versionId;
  }

  private buildVolunteerRecord(volunteer: Partial<Volunteer>) {
    return toFirestorePlainData({
      firstName: volunteer.firstName,
      lastName: volunteer.lastName,
      residence: volunteer.residence,
      address: volunteer.address,
      telephone: volunteer.telephone,
      img: volunteer.img,
      school: volunteer.school,
      level: volunteer.level,
      program: volunteer.program,
      email: volunteer.email,
      volunteeringInProg: volunteer.volunteeringInProg,
      createdAt: volunteer.createdAt,
      updatedAt: volunteer.updatedAt,
      latestVersionId: volunteer.latestVersionId,
      archived: volunteer.archived,
      archivedAt: volunteer.archivedAt,
      archivedReason: volunteer.archivedReason,
      archivedReasonDetail: volunteer.archivedReasonDetail,
      archivedBy: volunteer.archivedBy
    });
  }
}
