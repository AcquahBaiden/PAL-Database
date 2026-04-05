import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { Database, ref, objectVal, push, update, remove, runTransaction } from '@angular/fire/database';
import { Storage, ref as storageRef, getDownloadURL } from '@angular/fire/storage';
import { uploadBytesResumable } from 'firebase/storage';

import { Child } from '../interfaces/child.interface';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: "root",
})
export class ChildrenService {
  public uploadPercent: Observable<number | undefined>;
  public downloadURL!: Observable<string>;
  private childrenStream: Observable<Child[]>;

  private db = inject(Database);
  private storage = inject(Storage);
  private notiService = inject(NotificationService);

  constructor() {
    this.childrenStream = objectVal<{ [key: string]: Child }>(ref(this.db, "Children")).pipe(
      map((responseData) => {
        if (!responseData) return [];
        return Object.keys(responseData).map(key => ({
          ...responseData[key],
          id: key
        }));
      })
    );
  }

  getDbChildren(): Observable<Child[]> {
    return this.childrenStream;
  }

  async saveToDB(data: Child) {
    try {
      const listRef = ref(this.db, "Children");
      await push(listRef, data);
      const countRef = ref(this.db, "Summary/children/number");
      await runTransaction(countRef, (number) => (number || 0) + 1);
      this.notiService.setState(false, `${data.firstName} successfully saved`, true);
    } catch (error) {
      console.error('Error saving to DB:', error);
      this.notiService.setState(true, 'Something went wrong when saving profile', true);
    }
  }

  uploadFile(event: any, fileName: string) {
    const file = event.target.files[0];
    const fileRef = storageRef(this.storage, "children/" + fileName);
    const task = uploadBytesResumable(fileRef, file);
    this.uploadPercent = new Observable<number | undefined>(subscriber => {
      task.on('state_changed',
        (snapshot) => subscriber.next((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
        (error) => subscriber.error(error),
        () => subscriber.complete()
      );
    });
    task.then(() => {
      this.downloadURL = new Observable(subscriber => {
        getDownloadURL(fileRef).then(url => {
          subscriber.next(url);
          subscriber.complete();
        });
      });
    });
  }

  getChild(id: string): Observable<Child> {
    return objectVal<Child>(ref(this.db, "Children/" + id));
  }

  async updateChild(id: string, editedChild: Child) {
    try {
      await update(ref(this.db, "Children/" + id), editedChild as any);
      this.notiService.setState(false, 'Profile successfully updated', true);
    } catch (error) {
      console.error('Error updating child:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
    }
  }

  async updateChildProfile(id: string, fileName: string) {
    try {
      await update(ref(this.db, "Children/" + id), { img: fileName });
      this.notiService.setState(false, 'Profile photo successfully updated', true);
      return true;
    } catch (error) {
      console.error('Error updating profile photo:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile photo', true);
      return false;
    }
  }

  async deleteChild(id: string) {
    try {
      await remove(ref(this.db, "Children/" + id));
      const countRef = ref(this.db, "Summary/children/number");
      await runTransaction(countRef, (number) => Math.max(0, (number || 0) - 1));
      this.notiService.setState(false, 'Profile successfully deleted', true);
    } catch (error) {
      console.error('Error deleting child:', error);
      this.notiService.setState(true, 'Something went wrong when deleting profile', true);
    }
  }
}
