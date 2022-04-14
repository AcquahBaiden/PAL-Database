import { Injectable } from '@angular/core';
import { finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { ManagementMember } from '../interfaces/management-member.interface';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: "root",
})
export class ManagementService {
  public uploadPercent: Observable<number>;
  public downloadURL!: Observable<string>;
  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private notiService: NotificationService
  ) {}

  getMamangementData() {
    return this.db
      .object("Management")
      .valueChanges()
      .pipe(
        map((responseData: any) => {
          const MembersData: ManagementMember[] = [];
          for (const key in responseData) {
            if (responseData.hasOwnProperty(key)) {
              MembersData.push({ ...responseData[key], id: key });
            }
          }
          return MembersData;
        })
      );
  }

  getMember(id: string) {
    const ref = "Management/".concat(id);
    return this.db
      .object<ManagementMember>(ref)
      .valueChanges()
      .pipe(
        map((memeberData: ManagementMember) => {
          return memeberData;
        })
      );
  }

  saveToFirebase(data: ManagementMember) {
      try {
        const itemsRef = this.db.list("Management");
        itemsRef.push(data);
        this.db
          .object("Summary/management/number")
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
    const fileRef = this.storage.ref("management/" + fileName);
    const task = this.storage.upload("management/" + fileName, file);
    this.uploadPercent = task.percentageChanges();
    task
      .snapshotChanges()
      .pipe(finalize(() => (this.downloadURL = fileRef.getDownloadURL())))
      .subscribe();
  }

  deleteMember(id: string) {
    try {
      const volRef = this.db.list("Management/" + id);
      volRef.remove();
      this.db
        .object("Summary/management/number")
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

  updateManagementMember(id: string, editedMember: ManagementMember) {
    try {
      this.db.list("Management").update(id, editedMember);
      this.notiService.setState(false,'Profile successfully updated',true);
    } catch (error) {
      this.notiService.setState(true,'Something went wrong when updating profile',true);
    }
  }

  updateMemberProfilePhoto(id: string, fileName: string) {
    return this.db
      .list("Management/" + id)
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
