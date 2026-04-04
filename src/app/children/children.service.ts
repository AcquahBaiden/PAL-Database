import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { Child } from '../interfaces/child.interface';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: "root",
})
export class ChildrenService {
  public uploadPercent: Observable<number | undefined>;
  public downloadURL!: Observable<string>;
  private childrenStream: Observable<Child[]>;
  private envInjector = inject(EnvironmentInjector);

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private notiService: NotificationService
  ) {
    this.childrenStream = this.db
      .object<{ [key: string]: Child }>("Children")
      .valueChanges()
      .pipe(
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
      const itemsRef = this.db.list("Children");
      await itemsRef.push(data);
      await this.db
        .object("Summary/children/number")
        .query.ref.transaction((number) => {
          return (number || 0) + 1;
        });
      this.notiService.setState(false, `${data.firstName} successfully saved`, true);
    } catch (error) {
      console.error('Error saving to DB:', error);
      this.notiService.setState(true, 'Something went wrong when saving profile', true);
    }
  }

  uploadFile(event: any, fileName: string) {
    const file = event.target.files[0];
    const fileRef = this.storage.ref("children/" + fileName);
    const task = this.storage.upload("children/" + fileName, file);
    this.uploadPercent = task.percentageChanges();
    task
      .snapshotChanges()
      .pipe(finalize(() => (this.downloadURL = fileRef.getDownloadURL())))
      .subscribe();
  }

  getChild(id: string): Observable<Child> {
    return runInInjectionContext(this.envInjector, () => {
      return this.db.object<Child>("Children/" + id).valueChanges();
    });
  }

  async updateChild(id: string, editedChild: Child) {
    try {
      await runInInjectionContext(this.envInjector, () => this.db.object("Children/" + id).update(editedChild));
      this.notiService.setState(false, 'Profile successfully updated', true);
    } catch (error) {
      console.error('Error updating child:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
    }
  }

  async updateChildProfile(id: string, fileName: string) {
    try {
      await runInInjectionContext(this.envInjector, () => this.db.object("Children/" + id).update({ img: fileName }));
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
      await runInInjectionContext(this.envInjector, () => this.db.object("Children/" + id).remove());
      await runInInjectionContext(this.envInjector, () => 
        this.db.object("Summary/children/number").query.ref.transaction((number) => Math.max(0, (number || 0) - 1))
      );
      this.notiService.setState(false, 'Profile successfully deleted', true);
    } catch (error) {
      console.error('Error deleting child:', error);
      this.notiService.setState(true, 'Something went wrong when deleting profile', true);
    }
  }
}
