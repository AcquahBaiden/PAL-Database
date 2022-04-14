import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { Volunteer } from '../interfaces/volunteer.interface';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: "root",
})
export class VolunteersService {
  public uploadPercent: Observable<number>;
  public downloadURL!: Observable<string>;
  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private notiService:NotificationService
  ) {}

  getVolunteersData() {
    return this.db
      .object("Volunteers")
      .valueChanges()
      .pipe(
        map((responseData: any) => {
          const VolunteerData: Volunteer[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              VolunteerData.push({ ...responseData[key], id: key });
            }
          }
          return VolunteerData;
        })
      );
  }

  getVolunteer(id: string) {
    const ref = "Volunteers/".concat(id);
    return this.db
      .object(ref)
      .valueChanges()
      .pipe(
        map((responseData: Volunteer) => {
          return responseData;
        })
      );
  }

  saveToDB(data: Volunteer) {
    try {
      const itemsRef = this.db.list("Volunteers");
      itemsRef.push(data);
      this.db
        .object("Summary/volunteers/number")
        .query.ref.transaction((number) => {
          if (number === null) {
            return (number = 1);
          } else {
            return number + 1;
          }
        });
        this.notiService.setState(false,`${data.firstName} succesfully saved`,true);
    } catch (error) {
      console.log(error);
      this.notiService.setState(true,'Something went wrong when saving profile',true);
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

  deleteVolunteer(id: string) {
    try {
      const volRef = this.db.list("Volunteers/" + id);
      volRef.remove();
      this.db
        .object("Summary/volunteers/number")
        .query.ref.transaction((number) => {
          if (number === null) {
            return (number = 0);
          } else {
            return number - 1;
          }
        });
        this.notiService.setState(false,'Profile successfully deleted',true);
    } catch (error) {
      this.notiService.setState(true,'Something went wront when deleting profile',true);
    }

  }

  updateVolunteer(id: string, editedVolunteer: Volunteer) {
    try {
      this.db.list("Volunteers/").update(id, editedVolunteer);
      this.notiService.setState(false,'Profile successfully updated',true);
    } catch (error) {
      this.notiService.setState(true,'Something went wrong when updating profile',true);
    }
  }

  updateVolunteerProfilePhoto(id: string, fileName: string) {
    return this.db
      .list("Volunteers/" + id)
      .set("img", fileName)
      .then(() => {
        this.notiService.setState(false,'Profile successfully updated',true);
        return true;
      })
      .catch((error) => {
        this.notiService.setState(true,'Something went wrong when updating profile',true);
      });
  }
}
