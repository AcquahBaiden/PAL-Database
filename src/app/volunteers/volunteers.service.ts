import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Auth } from '@angular/fire/auth';
import { Database, objectVal } from '@angular/fire/database';
import { Storage, getDownloadURL, ref as storageRef } from '@angular/fire/storage';
import { get, push, ref, remove, set, update } from 'firebase/database';
import { uploadBytesResumable } from 'firebase/storage';

import { Volunteer } from '../interfaces/volunteer.interface';
import { ProfileVersion } from '../interfaces/profile-history.interface';
import { NotificationService } from '../notification/notification.service';

function sanitizeFirebaseData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeFirebaseData(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce((acc, [key, entryValue]) => {
      if (entryValue !== undefined) {
        acc[key] = sanitizeFirebaseData(entryValue);
      }
      return acc;
    }, {} as Record<string, unknown>) as T;
  }

  return value;
}

@Injectable({
  providedIn: 'root',
})
export class VolunteersService {
  public uploadPercent: Observable<number | undefined>;
  public downloadURL!: Observable<string>;
  private volunteersStream: Observable<Volunteer[]>;

  private db = inject(Database);
  private storage = inject(Storage);
  private auth = inject(Auth);
  private notiService = inject(NotificationService);

  constructor() {
    this.volunteersStream = objectVal<Record<string, Volunteer> | null>(ref(this.db, 'Volunteers')).pipe(
      map((responseData) => {
        if (!responseData) {
          return [];
        }

        return Object.keys(responseData).map((key) => ({
          ...responseData[key],
          id: key
        }));
      })
    );
  }

  getVolunteersData(): Observable<Volunteer[]> {
    return this.volunteersStream.pipe(
      map((volunteers) => volunteers.filter((volunteer) => !volunteer.archived))
    );
  }

  getArchivedVolunteers(): Observable<Volunteer[]> {
    return this.volunteersStream.pipe(
      map((volunteers) =>
        volunteers
          .filter((volunteer) => volunteer.archived)
          .sort((left, right) => (right.archivedAt || 0) - (left.archivedAt || 0))
      )
    );
  }

  getVolunteer(id: string): Observable<Volunteer> {
    return objectVal<Volunteer>(ref(this.db, 'Volunteers/' + id));
  }

  getVolunteerProfileHistory(id: string): Observable<ProfileVersion<Volunteer>[]> {
    return objectVal<Record<string, ProfileVersion<Volunteer>> | null>(ref(this.db, `VolunteersHistory/${id}`)).pipe(
      map((responseData) => {
        if (!responseData) {
          return [];
        }

        return Object.keys(responseData)
          .map((key) => ({
            ...responseData[key],
            id: key
          }))
          .sort((left, right) => (right.timestamp || 0) - (left.timestamp || 0));
      })
    );
  }

  async saveToDB(data: Volunteer): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const listRef = ref(this.db, 'Volunteers');
      const volunteerRef = push(listRef);
      await set(volunteerRef, sanitizeFirebaseData({
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
      await remove(ref(this.db, 'Volunteers/' + id));
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
      await update(ref(this.db, 'Volunteers/' + id), sanitizeFirebaseData({
        ...editedVolunteer,
        createdAt: currentVolunteer.createdAt || currentVolunteer.updatedAt || timestamp,
        updatedAt: timestamp,
        latestVersionId: versionId
      }) as any);

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
      await update(ref(this.db, 'Volunteers/' + id), {
        img: fileName,
        createdAt: currentVolunteer.createdAt || currentVolunteer.updatedAt || timestamp,
        updatedAt: timestamp,
        latestVersionId: versionId
      });

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
      await update(ref(this.db, 'Volunteers/' + id), sanitizeFirebaseData({
        archived: true,
        archivedAt: timestamp,
        archivedReason: reason,
        archivedReasonDetail: reasonDetail?.trim() || null,
        archivedBy: this.auth.currentUser?.email || null,
        updatedAt: timestamp,
        latestVersionId: versionId
      }) as any);

      this.notiService.setState(false, 'Profile successfully archived', true);
    } catch (error) {
      console.error('Error archiving volunteer:', error);
      this.notiService.setState(true, 'Something went wrong when archiving profile', true);
      throw error;
    }
  }

  private async getVolunteerSnapshot(id: string): Promise<Volunteer | null> {
    const snapshot = await get(ref(this.db, `Volunteers/${id}`));
    return snapshot.exists() ? (snapshot.val() as Volunteer) : null;
  }

  private async saveHistorySnapshot(id: string, volunteer: Volunteer, timestamp: number): Promise<string> {
    const historyListRef = ref(this.db, `VolunteersHistory/${id}`);
    const { id: _, ...profile } = volunteer;
    const historyRef = push(historyListRef);
    await set(historyRef, sanitizeFirebaseData({
      timestamp,
      profile
    }));

    return historyRef.key as string;
  }
}
