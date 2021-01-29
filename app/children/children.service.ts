import { Injectable } from '@angular/core';
import { finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AngularFireDatabase } from '../../../node_modules/@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';

import { Child } from '../interfaces/child.interface';
import { AuthService } from '../auth/auth.service';
import { FilterPipe } from '../children/filter.pipe'

@Injectable({
  providedIn: "root",
})
export class ChildrenService {
  public uploadPercent: Observable<number>;
  public downloadURL!: Observable<string>;

  constructor(
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private authService: AuthService
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
    this.db.list("Children/").update(id, editedChild);
  }

  updateChildProfile(id: string, fileName: string) {
    return this.db
      .list("Children/" + id)
      .set("img", fileName)
      .then(() => {
        return true;
      })
      .catch((error) => {
        //////////////////Fix this
      });
  }

  deleteChild(id: string) {
    const childRef = this.db.list("Children/" + id);
    setTimeout(() => {
      childRef.remove();
    }, 1800);
    this.db
      .object("Summary/children/number")
      .query.ref.transaction((number) => {
        if (number === null) {
          return (number = 0);
        } else {
          return number - 1;
        }
      });
  }
}
