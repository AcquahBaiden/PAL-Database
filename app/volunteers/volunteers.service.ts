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
    return this.db.object('Volunteers').valueChanges();
  }

  getVolunteer(id:string){
    const ref = 'Volunteers/'.concat(id);
    return this.db.object(ref).valueChanges()
      .pipe(
        map((responseData:any)=>{
          const volunteerData:Volunteer[]=[];
          volunteerData.push(responseData);
          return volunteerData;
        })
      );
  }
  saveToFirebase(data: Volunteer){
    const itemsRef = this.db.list('Volunteers');
    itemsRef.push(data);
  }

  uploadFile(event: any, fileName:string) {
    console.log('on the other side');
    const file = event.target.files[0];
    const fileRef = this.storage.ref('children/'+fileName);
    const task = this.storage.upload('children/'+fileName, file);
    this.uploadPercent = task.percentageChanges();
    task.snapshotChanges().pipe(
      finalize(() => this.downloadURL = fileRef.getDownloadURL() )
   )
  .subscribe()
  }

  deleteVolunteer(id: string){
    const volRef = this.db.list('Vlounteers/'+id);
    volRef.remove();

  }
}
