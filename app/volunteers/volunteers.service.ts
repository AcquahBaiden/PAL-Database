import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs/internal/Observable';
import { finalize, map } from 'rxjs/operators';
import { Volunteer } from '../interfaces/volunteer.interface';

@Injectable({
  providedIn: 'root'
})
export class VolunteersService {
  public uploadPercent: Observable<number>;
  public downloadURL!: Observable<string>;
  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage) { }

  getVolunteersData(){
    return this.db.object('Volunteers').valueChanges()
    .pipe(
      map((responseData:any)=>{
        const VolunteerData:Volunteer[] = [];
          for(const key in responseData){
            if(responseData.hasOwnProperty(key)){
              VolunteerData.push({...responseData[key], id: key})
            }
          }
          return VolunteerData;
      }

      )
    );
  }

  getVolunteer(id:string){
    const ref = 'Volunteers/'.concat(id);
    return this.db.object(ref).valueChanges()
      .pipe(
        map((responseData:Volunteer)=>{
          return responseData;
        })
      );
  }

  saveToDB(data: Volunteer){
    const itemsRef = this.db.list('Volunteers');
    itemsRef.push(data);
    this.db.object('Summary/volunteers/number').query.ref
      .transaction(number=>{
        if(number===null){
          return number = 1
        }else{
          return number + 1;
        }
      })
  }

  uploadFile(event: any, fileName:string) {
    const file = event.target.files[0];
    const fileRef = this.storage.ref('volunteers/'+fileName);
    const task = this.storage.upload('volunteers/'+fileName, file);
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => this.downloadURL = fileRef.getDownloadURL() )
   )
  .subscribe()
  }

  deleteVolunteer(id: string){
    const volRef = this.db.list('Volunteers/'+id);
    volRef.remove();
    this.db.object('Summary/volunteers/number').query.ref
      .transaction(number=>{
        if(number===null){
          return number = 0
        }else{
          return number - 1;
        }
      })
  }

  updateVolunteer(id:string, editedVolunteer:Volunteer){
    this.db.list('Volunteers/').update(id, editedVolunteer);
  }

  updateVolunteerProfilePhoto(id:string,fileName:string){
    return this.db.list('Volunteers/'+id).set('img',fileName).then(()=>{return true}).catch(error=>{console.log('Error uploading it')});
  }


}
