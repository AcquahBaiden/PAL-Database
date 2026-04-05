import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc
} from '@angular/fire/firestore';
import { Storage, ref as storageRef, getDownloadURL } from '@angular/fire/storage';
import { uploadBytesResumable } from 'firebase/storage';

import { ManagementMember } from '../interfaces/management-member.interface';
import { NotificationService } from '../notification/notification.service';
import { compareByName, observeCollectionData, observeDocumentData, toFirestorePlainData } from '../shared/firestore-data.utils';

@Injectable({
  providedIn: "root",
})
export class ManagementService {
  public uploadPercent: Observable<number | undefined>;
  public downloadURL!: Observable<string>;

  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private notiService = inject(NotificationService);

  private readonly managementCollection = collection(this.firestore, 'management');
  private readonly managementStream = observeCollectionData<ManagementMember>(
    query(this.managementCollection, orderBy('lastName', 'asc')),
    { idField: 'id' }
  ).pipe(
    map((members) => members.sort(compareByName))
  );

  getMamangementData(): Observable<ManagementMember[]> {
    return this.managementStream;
  }

  getMember(id: string): Observable<ManagementMember> {
    return observeDocumentData<ManagementMember>(doc(this.firestore, 'management', id), { idField: 'id' }) as Observable<ManagementMember>;
  }

  async saveToFirebase(data: ManagementMember): Promise<boolean> {
    try {
      await addDoc(this.managementCollection, this.buildManagementRecord(data));
      this.notiService.setState(false, `${data.firstName} successfully saved`, true);
      return true;
    } catch (error) {
      console.error('Error saving management member:', error);
      this.notiService.setState(true, 'Something went wrong when saving profile', true);
      return false;
    }
  }

  async uploadFile(event: any, fileName: string): Promise<string> {
    const file = event.target.files[0];
    if (!file) {
      throw new Error('No file selected');
    }

    const fileRef = storageRef(this.storage, "management/" + fileName);
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

  async deleteMember(id: string) {
    try {
      await deleteDoc(doc(this.firestore, 'management', id));
      this.notiService.setState(false, 'Profile successfully deleted', true);
    } catch (error) {
      console.error('Error deleting management member:', error);
      this.notiService.setState(true, 'Something went wrong when deleting profile', true);
    }
  }

  async updateManagementMember(id: string, editedMember: ManagementMember) {
    try {
      await setDoc(doc(this.firestore, 'management', id), this.buildManagementRecord(editedMember), { merge: true });
      this.notiService.setState(false, 'Profile successfully updated', true);
    } catch (error) {
      console.error('Error updating management member:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
    }
  }

  async updateMemberProfilePhoto(id: string, fileName: string) {
    try {
      await setDoc(doc(this.firestore, 'management', id), this.buildManagementRecord({ img: fileName }), { merge: true });
      this.notiService.setState(false, 'Profile photo successfully updated', true);
      return true;
    } catch (error) {
      console.error('Error updating management profile photo:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
      return false;
    }
  }

  private buildManagementRecord(member: Partial<ManagementMember>) {
    return toFirestorePlainData({
      firstName: member.firstName,
      lastName: member.lastName,
      residence: member.residence,
      email: member.email,
      address: member.address,
      description: member.description,
      telephone: member.telephone,
      img: member.img,
      position: member.position
    });
  }
}
