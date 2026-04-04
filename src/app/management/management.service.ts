import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ManagementMember } from '../interfaces/management-member.interface';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: "root",
})
export class ManagementService {
  public uploadPercent: Observable<number | undefined>;
  public downloadURL!: Observable<string>;
  private managementStream: Observable<ManagementMember[]>;
  private envInjector = inject(EnvironmentInjector);

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private notiService: NotificationService
  ) {
    this.managementStream = this.db
      .object<{ [key: string]: ManagementMember }>("Management")
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

  getMamangementData(): Observable<ManagementMember[]> {
    return this.managementStream;
  }

  getMember(id: string): Observable<ManagementMember> {
    return runInInjectionContext(this.envInjector, () => {
      return this.db.object<ManagementMember>("Management/" + id).valueChanges();
    });
  }

  async saveToFirebase(data: ManagementMember) {
    try {
      await runInInjectionContext(this.envInjector, async () => {
        const itemsRef = this.db.list("Management");
        await itemsRef.push(data);
        await this.db
          .object("Summary/management/number")
          .query.ref.transaction((number) => {
            return (number || 0) + 1;
          });
      });
      this.notiService.setState(false, `${data.firstName} successfully saved`, true);
    } catch (error) {
      console.error('Error saving management member:', error);
      this.notiService.setState(true, 'Something went wrong when saving profile', true);
    }
  }

  uploadFile(event: any, fileName: string) {
    const file = event.target.files[0];
    const fileRef = this.storage.ref("management/" + fileName);
    const task = this.storage.upload("management/" + fileName, file);
    this.uploadPercent = task.percentageChanges();
    task
      .snapshotChanges()
      .pipe(finalize(() => (this.downloadURL = fileRef.getDownloadURL())))
      .subscribe();
  }

  async deleteMember(id: string) {
    try {
      await runInInjectionContext(this.envInjector, async () => {
        await this.db.object("Management/" + id).remove();
        await this.db
          .object("Summary/management/number")
          .query.ref.transaction((number) => {
            return Math.max(0, (number || 0) - 1);
          });
      });
      this.notiService.setState(false, 'Profile successfully deleted', true);
    } catch (error) {
      console.error('Error deleting management member:', error);
      this.notiService.setState(true, 'Something went wrong when deleting profile', true);
    }
  }

  async updateManagementMember(id: string, editedMember: ManagementMember) {
    try {
      await runInInjectionContext(this.envInjector, async () => {
        await this.db.object("Management/" + id).update(editedMember);
      });
      this.notiService.setState(false, 'Profile successfully updated', true);
    } catch (error) {
      console.error('Error updating management member:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
    }
  }

  async updateMemberProfilePhoto(id: string, fileName: string) {
    try {
      await runInInjectionContext(this.envInjector, async () => {
        await this.db.object("Management/" + id).update({ img: fileName });
      });
      this.notiService.setState(false, 'Profile photo successfully updated', true);
      return true;
    } catch (error) {
      console.error('Error updating management profile photo:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
      return false;
    }
  }
}
