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

import { Child } from '../interfaces/child.interface';
import { ProfileVersion } from '../interfaces/profile-history.interface';
import { NotificationService } from '../notification/notification.service';
import { compareByName, observeCollectionData, observeDocumentData, toFirestorePlainData } from '../shared/firestore-data.utils';

@Injectable({
  providedIn: 'root',
})
export class ChildrenService {
  public uploadPercent: Observable<number | undefined>;
  public downloadURL!: Observable<string>;

  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private auth = inject(Auth);
  private notiService = inject(NotificationService);

  private readonly childrenCollection = collection(this.firestore, 'children');
  private readonly activeChildrenQuery = query(this.childrenCollection, where('archived', '==', false));
  private readonly archivedChildrenQuery = query(this.childrenCollection, where('archived', '==', true));
  private readonly childrenStream = observeCollectionData<Child>(this.activeChildrenQuery, { idField: 'id' }).pipe(
    map((children) => children.sort(compareByName))
  );
  private readonly archivedChildrenStream = observeCollectionData<Child>(this.archivedChildrenQuery, { idField: 'id' }).pipe(
    map((children) => children.sort((left, right) => (right.archivedAt || 0) - (left.archivedAt || 0)))
  );

  getDbChildren(): Observable<Child[]> {
    return this.childrenStream;
  }

  getArchivedChildren(): Observable<Child[]> {
    return this.archivedChildrenStream;
  }

  async saveToDB(data: Child): Promise<boolean> {
    try {
      const timestamp = Date.now();
      await addDoc(this.childrenCollection, this.buildChildRecord({
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
        archived: false
      }));

      this.notiService.setState(false, `${data.firstName} successfully saved`, true);
      return true;
    } catch (error) {
      console.error('Error saving to Firestore:', error);
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
    return observeDocumentData<Child>(doc(this.firestore, 'children', id), { idField: 'id' }) as Observable<Child>;
  }

  getChildProfileHistory(id: string): Observable<ProfileVersion<Child>[]> {
    return observeCollectionData<ProfileVersion<Child>>(
      query(collection(this.firestore, 'children', id, 'history'), orderBy('timestamp', 'desc')),
      { idField: 'id' }
    );
  }

  async updateChild(id: string, editedChild: Partial<Child>) {
    try {
      const currentChild = await this.getChildSnapshot(id);
      if (!currentChild) {
        throw new Error('Child profile not found');
      }

      const timestamp = Date.now();
      const versionId = await this.saveHistorySnapshot(id, currentChild, timestamp);
      await setDoc(doc(this.firestore, 'children', id), this.buildChildRecord({
        ...currentChild,
        ...editedChild,
        createdAt: currentChild.createdAt || currentChild.updatedAt || timestamp,
        updatedAt: timestamp,
        latestVersionId: versionId
      }));

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
      await setDoc(doc(this.firestore, 'children', id), this.buildChildRecord({
        ...currentChild,
        img: fileName,
        createdAt: currentChild.createdAt || currentChild.updatedAt || timestamp,
        updatedAt: timestamp,
        latestVersionId: versionId
      }));

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
      await setDoc(doc(this.firestore, 'children', id), this.buildChildRecord({
        ...currentChild,
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
      console.error('Error archiving child:', error);
      this.notiService.setState(true, 'Something went wrong when archiving profile', true);
      throw error;
    }
  }

  async deleteChild(id: string) {
    try {
      await deleteDoc(doc(this.firestore, 'children', id));
      this.notiService.setState(false, 'Profile successfully deleted', true);
    } catch (error) {
      console.error('Error deleting child:', error);
      this.notiService.setState(true, 'Something went wrong when deleting profile', true);
    }
  }

  private async getChildSnapshot(id: string): Promise<Child | null> {
    const snapshot = await getDoc(doc(this.firestore, 'children', id));
    if (!snapshot.exists()) {
      return null;
    }

    return {
      ...(snapshot.data() as Child),
      id: snapshot.id
    };
  }

  private async saveHistorySnapshot(id: string, child: Child, timestamp: number): Promise<string> {
    const versionId = `${timestamp}-${Math.random().toString(36).slice(2, 10)}`;
    await setDoc(doc(this.firestore, 'children', id, 'history', versionId), toFirestorePlainData({
      timestamp,
      profile: this.buildChildRecord(child)
    }));

    return versionId;
  }

  private buildChildRecord(child: Partial<Child>) {
    return toFirestorePlainData({
      firstName: child.firstName,
      lastName: child.lastName,
      residence: child.residence,
      address: child.address,
      description: child.description,
      telephone: child.telephone,
      img: child.img,
      class: child.class,
      school: child.school,
      parentName: child.parentName,
      parentTel: child.parentTel,
      interests: child.interests,
      programs: child.programs,
      createdAt: child.createdAt,
      updatedAt: child.updatedAt,
      latestVersionId: child.latestVersionId,
      archived: child.archived,
      archivedAt: child.archivedAt,
      archivedReason: child.archivedReason,
      archivedReasonDetail: child.archivedReasonDetail,
      archivedBy: child.archivedBy
    });
  }
}
