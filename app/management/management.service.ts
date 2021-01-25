import { Injectable } from '@angular/core';
import { finalize, map } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { ManagementMember } from '../interfaces/management-member.interface';

@Injectable({
  providedIn: 'root'
})
export class ManagementService {
  public uploadPercent: Observable<number>;
  public downloadURL!: Observable<string>;
  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage) { }


  getMamangementData(){
    return this.db.object('Management').valueChanges()
    .pipe(
      map((responseData:any)=>{
        const MembersData: ManagementMember[]=[];
        for(const key in responseData){
          if(responseData.hasOwnProperty(key)){
            MembersData.push({...responseData[key], id: key})
          }
        }
        return MembersData
      }
    )
    );;
  }

  getMember(id:string){
    const ref = 'Management/'.concat(id);
    return this.db.object<ManagementMember>(ref).valueChanges()
      .pipe(
        map((memeberData:ManagementMember)=>{
          return memeberData;
        })
      );
  }

  saveToFirebase(data: ManagementMember){
    const itemsRef = this.db.list('Management');
    itemsRef.push(data);
    this.db.object('Summary/management/number').query.ref
      .transaction(number=>{
        if(number===null){
          return number = 1
        }else{
          return number + 1;
        }
      })
  }

  uploadFile(event: any, fileName:string) {
    console.log('on the other side');
    const file = event.target.files[0];
    const fileRef = this.storage.ref('management/'+fileName);
    const task = this.storage.upload('management/'+fileName, file);
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => this.downloadURL = fileRef.getDownloadURL() )
   )
  .subscribe()
  }

  deleteMember(id: string){
    const volRef = this.db.list('Management/'+id);
    volRef.remove();
    this.db.object('Summary/management/number').query.ref
      .transaction(number=>{
        if(number===null){
          return number = 0
        }else{
          return number - 1;
        }
      })
  }

  updateManagementMember(id:string, editedMember: ManagementMember){
    this.db.list('Management').update(id,editedMember);
  }

  updateMemberProfilePhoto(id:string,fileName:string){
    return this.db.list('Management/'+id).set('img',fileName).then(()=>{return true}).catch(error=>{console.log('Error uploading it')});
  }
}
