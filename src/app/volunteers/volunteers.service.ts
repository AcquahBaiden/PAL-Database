import { Injectable, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Volunteer } from '../interfaces/volunteer.interface';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: "root",
})
export class VolunteersService {
  public uploadPercent: Observable<number | undefined>;
  public downloadURL!: Observable<string>;
  private volunteersStream: Observable<Volunteer[]>;
  private envInjector = inject(EnvironmentInjector);

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private notiService: NotificationService
  ) {
    this.volunteersStream = this.db
      .object<{ [key: string]: Volunteer }>("Volunteers")
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

  getVolunteersData(): Observable<Volunteer[]> {
    return this.volunteersStream;
  }

  getVolunteer(id: string): Observable<Volunteer> {
    return runInInjectionContext(this.envInjector, () => {
      return this.db.object<Volunteer>("Volunteers/" + id).valueChanges();
    });
  }

  async saveToDB(data: Volunteer) {
    try {
      await runInInjectionContext(this.envInjector, async () => {
        const itemsRef = this.db.list("Volunteers");
        await itemsRef.push(data);
        await this.db
          .object("Summary/volunteers/number")
          .query.ref.transaction((number) => {
            return (number || 0) + 1;
          });
      });
      this.notiService.setState(false, `${data.firstName} successfully saved`, true);
    } catch (error) {
      console.error('Error saving volunteer:', error);
      this.notiService.setState(true, 'Something went wrong when saving profile', true);
    }
  }

  uploadFile(event: any, fileName: string) {
    const file = event.target.files[0];
    const fileRef = this.storage.ref("volunteers/" + fileName);
    const task = this.storage.upload("volunteers/" + fileName, file);
    this.uploadPercent = task.percentageChanges();
    task
      .snapshotChanges()
      .pipe(finalize(() => (this.downloadURL = fileRef.getDownloadURL())))
      .subscribe();
  }

  async deleteVolunteer(id: string) {
    try {
      await runInInjectionContext(this.envInjector, async () => {
        await this.db.object("Volunteers/" + id).remove();
        await this.db
          .object("Summary/volunteers/number")
          .query.ref.transaction((number) => {
            return Math.max(0, (number || 0) - 1);
          });
      });
      this.notiService.setState(false, 'Profile successfully deleted', true);
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      this.notiService.setState(true, 'Something went wrong when deleting profile', true);
    }
  }

  async updateVolunteer(id: string, editedVolunteer: Volunteer) {
    try {
      await runInInjectionContext(this.envInjector, async () => {
        await this.db.object("Volunteers/" + id).update(editedVolunteer);
      });
      this.notiService.setState(false, 'Profile successfully updated', true);
    } catch (error) {
      console.error('Error updating volunteer:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
    }
  }

  async updateVolunteerProfilePhoto(id: string, fileName: string) {
    try {
      await runInInjectionContext(this.envInjector, async () => {
        await this.db.object("Volunteers/" + id).update({ img: fileName });
      });
      this.notiService.setState(false, 'Profile photo successfully updated', true);
      return true;
    } catch (error) {
      console.error('Error updating volunteer photo:', error);
      this.notiService.setState(true, 'Something went wrong when updating profile', true);
      return false;
    }
  }
}
