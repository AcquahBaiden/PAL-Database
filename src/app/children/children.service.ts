import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Auth } from '@angular/fire/auth';
import { Database, objectVal } from '@angular/fire/database';
import { Storage, getDownloadURL, ref as storageRef } from '@angular/fire/storage';
import { get, push, ref, remove, set, update } from 'firebase/database';
import { uploadBytesResumable } from 'firebase/storage';

import { Child } from '../interfaces/child.interface';
import { ProfileVersion } from '../interfaces/profile-history.interface';
import { NotificationService } from '../notification/notification.service';

function sanitizeFirebaseData<T>(value: T, seen = new WeakSet<object>()): T {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeFirebaseData(item, seen))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === 'object') {
    if (seen.has(value as object)) {
      return undefined as T;
    }

    seen.add(value as object);
    return Object.entries(value as Record<string, unknown>).reduce((acc, [key, entryValue]) => {
      if (entryValue !== undefined) {
        const sanitizedEntry = sanitizeFirebaseData(entryValue, seen);
        if (sanitizedEntry !== undefined) {
          acc[key] = sanitizedEntry;
        }
      }
      return acc;
    }, {} as Record<string, unknown>) as T;
  }

  return value;
}

@Injectable({
  providedIn: 'root',
})
export class ChildrenService {
  public uploadPercent: Observable<number | undefined>;
  public downloadURL!: Observable<string>;
  private childrenStream: Observable<Child[]>;

  private db = inject(Database);
  private storage = inject(Storage);
  private auth = inject(Auth);
  private notiService = inject(NotificationService);

  constructor() {
    this.childrenStream = objectVal<Record<string, Child> | null>(ref(this.db, 'Children')).pipe(
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

  getDbChildren(): Observable<Child[]> {
    return this.childrenStream.pipe(
      map((children) => children.filter((child) => !child.archived))
    );
  }

  getArchivedChildren(): Observable<Child[]> {
    return this.childrenStream.pipe(
      map((children) =>
        children
          .filter((child) => child.archived)
          .sort((left, right) => (right.archivedAt || 0) - (left.archivedAt || 0))
      )
    );
  }

  async saveToDB(data: Child): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const listRef = ref(this.db, 'Children');
      const childRef = push(listRef);
      await set(childRef, sanitizeFirebaseData({
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        archived: false
      }));

      this.notiService.setState(false, `${data.firstName} successfully saved`, true);
      return true;
    } catch (error) {
      console.error('Error saving to DB:', error);
      this.notiService.setState(true, 'Something went wrong when saving profile', true);
      return false;
    }
  }

  async uploadFile(event: any, fileName: string): Promise<string> {
    const file = event.target.files[0];
    if (!file) {
      throw new Error('No file selected');
    }
    const fileRef = storageRef(this.storage, 'children/' + fileName);
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

  getChild(id: string): Observable<Child> {
    return objectVal<Child>(ref(this.db, 'Children/' + id));
  }

  getChildProfileHistory(id: string): Observable<ProfileVersion<Child>[]> {
    return objectVal<Record<string, ProfileVersion<Child>> | null>(ref(this.db, `ChildrenHistory/${id}`)).pipe(
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

  async updateChild(id: string, editedChild: Partial<Child>) {
    try {
      console.debug('[ChildrenService.updateChild] start', { id });
      const currentChild = await this.getChildSnapshot(id);
      if (!currentChild) {
        throw new Error('Child profile not found');
      }

      const timestamp = Date.now();
      console.debug('[ChildrenService.updateChild] snapshot loaded', { id, hasImage: !!currentChild.img });
      const versionId = await this.saveHistorySnapshot(id, currentChild, timestamp);
      console.debug('[ChildrenService.updateChild] history saved', { id, versionId });
      const payload = sanitizeFirebaseData({
        ...currentChild,
        ...editedChild,
        createdAt: currentChild.createdAt || currentChild.updatedAt || timestamp,
        updatedAt: timestamp,
        latestVersionId: versionId
      }) as any;

      await set(ref(this.db, 'Children/' + id), payload);
      console.debug('[ChildrenService.updateChild] profile saved', { id, versionId });

      this.notiService.setState(false, 'Profile successfully updated', true);
    } catch (error) {
      console.error('Error updating child:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
      throw error;
    }
  }

  async updateChildProfile(id: string, fileName: string) {
    try {
      const currentChild = await this.getChildSnapshot(id);
      if (!currentChild) {
        throw new Error('Child profile not found');
      }

      const timestamp = Date.now();
      const versionId = await this.saveHistorySnapshot(id, currentChild, timestamp);
      await set(ref(this.db, 'Children/' + id), sanitizeFirebaseData({
        ...currentChild,
        img: fileName,
        createdAt: currentChild.createdAt || currentChild.updatedAt || timestamp,
        updatedAt: timestamp,
        latestVersionId: versionId
      }) as any);

      this.notiService.setState(false, 'Profile photo successfully updated', true);
      return true;
    } catch (error) {
      console.error('Error updating profile photo:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile photo', true);
      return false;
    }
  }

  async archiveChild(id: string, reason: string, reasonDetail?: string) {
    try {
      const currentChild = await this.getChildSnapshot(id);
      if (!currentChild) {
        throw new Error('Child profile not found');
      }

      const timestamp = Date.now();
      const versionId = await this.saveHistorySnapshot(id, currentChild, timestamp);
      await set(ref(this.db, 'Children/' + id), sanitizeFirebaseData({
        ...currentChild,
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
      console.error('Error archiving child:', error);
      this.notiService.setState(true, 'Something went wrong when archiving profile', true);
      throw error;
    }
  }

  async deleteChild(id: string) {
    try {
      await remove(ref(this.db, 'Children/' + id));
      this.notiService.setState(false, 'Profile successfully deleted', true);
    } catch (error) {
      console.error('Error deleting child:', error);
      this.notiService.setState(true, 'Something went wrong when deleting profile', true);
    }
  }

  private async getChildSnapshot(id: string): Promise<Child | null> {
    const snapshot = await get(ref(this.db, `Children/${id}`));
    return snapshot.exists() ? (snapshot.val() as Child) : null;
  }

  private async saveHistorySnapshot(id: string, child: Child, timestamp: number): Promise<string> {
    const historyListRef = ref(this.db, `ChildrenHistory/${id}`);
    const { id: _, ...profile } = child;
    const historyRef = push(historyListRef);
    await set(historyRef, sanitizeFirebaseData({
      timestamp,
      profile
    }));

    return historyRef.key as string;
  }
}
