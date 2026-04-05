import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Database, ref, objectVal, push, update, remove, runTransaction } from '@angular/fire/database';
import { Storage, ref as storageRef, getDownloadURL } from '@angular/fire/storage';
import { uploadBytesResumable } from 'firebase/storage';

import { ManagementMember } from '../interfaces/management-member.interface';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: "root",
})
export class ManagementService {
  public uploadPercent: Observable<number | undefined>;
  public downloadURL!: Observable<string>;
  private managementStream: Observable<ManagementMember[]>;

  private db = inject(Database);
  private storage = inject(Storage);
  private notiService = inject(NotificationService);

  constructor() {
    this.managementStream = objectVal<{ [key: string]: ManagementMember }>(ref(this.db, "Management")).pipe(
      map((responseData) => {
        if (!responseData) return [];
        return Object.keys(responseData).map(key => ({
          ...responseData[key],
          id: key
        }));
      })
    );
  }

  getMamangementData(): Observable<ManagementMember[]> {
    return this.managementStream;
  }

  getMember(id: string): Observable<ManagementMember> {
    return objectVal<ManagementMember>(ref(this.db, "Management/" + id));
  }

  async saveToFirebase(data: ManagementMember) {
    try {
      const listRef = ref(this.db, "Management");
      await push(listRef, data);
      const countRef = ref(this.db, "Summary/management/number");
      await runTransaction(countRef, (number) => (number || 0) + 1);
      this.notiService.setState(false, `${data.firstName} successfully saved`, true);
    } catch (error) {
      console.error('Error saving management member:', error);
      this.notiService.setState(true, 'Something went wrong when saving profile', true);
    }
  }

  uploadFile(event: any, fileName: string) {
    const file = event.target.files[0];
    const fileRef = storageRef(this.storage, "management/" + fileName);
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

  async deleteMember(id: string) {
    try {
      await remove(ref(this.db, "Management/" + id));
      const countRef = ref(this.db, "Summary/management/number");
      await runTransaction(countRef, (number) => Math.max(0, (number || 0) - 1));
      this.notiService.setState(false, 'Profile successfully deleted', true);
    } catch (error) {
      console.error('Error deleting management member:', error);
      this.notiService.setState(true, 'Something went wrong when deleting profile', true);
    }
  }

  async updateManagementMember(id: string, editedMember: ManagementMember) {
    try {
      await update(ref(this.db, "Management/" + id), editedMember as any);
      this.notiService.setState(false, 'Profile successfully updated', true);
    } catch (error) {
      console.error('Error updating management member:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
    }
  }

  async updateMemberProfilePhoto(id: string, fileName: string) {
    try {
      await update(ref(this.db, "Management/" + id), { img: fileName });
      this.notiService.setState(false, 'Profile photo successfully updated', true);
      return true;
    } catch (error) {
      console.error('Error updating management profile photo:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
      return false;
    }
  }
}
