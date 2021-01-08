import { Injectable } from '@angular/core';
import { Child } from '../interfaces/child.interface';
import { AngularFireDatabase } from '../../../node_modules/@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChildrenService{
  public uploadPercent: Observable<number>;
  public downloadURL!: Observable<string>;


  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage, private authService: AuthService) { }



  getDbChildren(){
    return this.db.object<Child[]>('Children').valueChanges()
    .pipe(
      map((responseData:any)=>{
        const ChildrenData:Child[] = [];
        for(const key in responseData){
          if(responseData.hasOwnProperty(key)){
            ChildrenData.push({...responseData[key], id: key})
          }
        }
        return ChildrenData;
      })
    );

  }

  saveToFirebase(data: Child){
    const itemsRef = this.db.list('Children');
    itemsRef.push(data);
  }

  uploadFile(event: any, fileName:string) {
    const file = event.target.files[0];
    const fileRef = this.storage.ref('children/'+fileName);
    const task = this.storage.upload('children/'+fileName, file);
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => this.downloadURL = fileRef.getDownloadURL() )
   )
  .subscribe()
  }

  getChild(id: string){
    return this.db.object('Children/'+id).valueChanges()
      .pipe(
        map((responseData:any)=>{
          const ChildData:Child[] = [];
          ChildData.push(responseData);
          return ChildData;
        })
      );
  }

  deleteChild(id:string){
    const childRef = this.db.list('Children/'+id);
    childRef.remove();
  }

}
