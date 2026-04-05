import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Database, ref, objectVal, push, update, remove, runTransaction } from '@angular/fire/database';
import { Storage, ref as storageRef, getDownloadURL } from '@angular/fire/storage';
import { uploadBytesResumable } from 'firebase/storage';

import { Volunteer } from '../interfaces/volunteer.interface';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: "root",
})
export class VolunteersService {
  public uploadPercent: Observable<number | undefined>;
  public downloadURL!: Observable<string>;
  private volunteersStream: Observable<Volunteer[]>;

  private db = inject(Database);
  private storage = inject(Storage);
  private notiService = inject(NotificationService);

  constructor() {
    this.volunteersStream = objectVal<{ [key: string]: Volunteer }>(ref(this.db, "Volunteers")).pipe(
      map((responseData) => {
        if (!responseData) return [];
        return Object.keys(responseData).map(key => ({
          ...responseData[key],
          id: key
        }));
      })
    );
  }

  getVolunteersData(): Observable<Volunteer[]> {
    return this.volunteersStream;
  }

  getVolunteer(id: string): Observable<Volunteer> {
    return objectVal<Volunteer>(ref(this.db, "Volunteers/" + id));
  }

  async saveToDB(data: Volunteer) {
    try {
      const listRef = ref(this.db, "Volunteers");
      await push(listRef, data);
      const countRef = ref(this.db, "Summary/volunteers/number");
      await runTransaction(countRef, (number) => (number || 0) + 1);
      this.notiService.setState(false, `${data.firstName} successfully saved`, true);
    } catch (error) {
      console.error('Error saving volunteer:', error);
      this.notiService.setState(true, 'Something went wrong when saving profile', true);
    }
  }

  uploadFile(event: any, fileName: string) {
    const file = event.target.files[0];
    const fileRef = storageRef(this.storage, "volunteers/" + fileName);
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

  async deleteVolunteer(id: string) {
    try {
      await remove(ref(this.db, "Volunteers/" + id));
      const countRef = ref(this.db, "Summary/volunteers/number");
      await runTransaction(countRef, (number) => Math.max(0, (number || 0) - 1));
      this.notiService.setState(false, 'Profile successfully deleted', true);
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      this.notiService.setState(true, 'Something went wrong when deleting profile', true);
    }
  }

  async updateVolunteer(id: string, editedVolunteer: Volunteer) {
    try {
      await update(ref(this.db, "Volunteers/" + id), editedVolunteer as any);
      this.notiService.setState(false, 'Profile successfully updated', true);
    } catch (error) {
      console.error('Error updating volunteer:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
    }
  }

  async updateVolunteerProfilePhoto(id: string, fileName: string) {
    try {
      await update(ref(this.db, "Volunteers/" + id), { img: fileName });
      this.notiService.setState(false, 'Profile photo successfully updated', true);
      return true;
    } catch (error) {
      console.error('Error updating volunteer photo:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
      return false;
    }
  }
}
