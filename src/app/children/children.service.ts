import { Injectable } from '@angular/core';
import { finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AngularFireDatabase } from '../../../node_modules/@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';

import { Child } from '../interfaces/child.interface';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: "root",
})
export class ChildrenService {
  public uploadPercent: Observable<number>;
  public downloadURL!: Observable<string>;

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private notiService: NotificationService
  ) {}

  getDbChildren() {
    return this.db
      .object<Child[]>("Children")
      .valueChanges()
      .pipe(
        map((responseData: any) => {
          const ChildrenData: Child[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              ChildrenData.push({ ...responseData[key], id: key });
            }
          }
          return ChildrenData;
        })
      );
  }

  saveToDB(data: Child) {
      try {
        const itemsRef = this.db.list("Children");
        itemsRef.push(data);
        this.db
          .object("Summary/children/number")
          .query.ref.transaction((number) => {
            if (number === null) {
              return (number = 1);
            } else {
              return number + 1;
            }
          });
          this.notiService.setState(false,`${data.firstName} succesfully saved`,true);
      } catch (error) {
        this.notiService.setState(true,'Something went wrong when saving profile',true);
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

  getChild(id: string) {
    return this.db
      .object("Children/" + id)
      .valueChanges()
      .pipe(
        map((responseData: Child) => {
          return responseData;
        })
      );
  }

  updateChild(id: string, editedChild: Child) {
    try {
      this.db.list("Children/").update(id, editedChild);
      this.notiService.setState(false,'Profile successfully updated',true);
    } catch (error) {
      this.notiService.setState(true,'Something went wrong when updating profile',true);
    }
  }

  updateChildProfile(id: string, fileName: string) {
    return this.db
      .list("Children/" + id)
      .set("img", fileName)
      .then(() => {
        this.notiService.setState(false,'Profile successfully updated',true);
        return true;
      })
      .catch(() => {
        this.notiService.setState(true,'Something went wrong when updating profile',true);
      });
  }

  deleteChild(id: string) {

    try {
      const childRef = this.db.list("Children/" + id);
      childRef.remove();
      this.db
        .object("Summary/children/number")
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
}
