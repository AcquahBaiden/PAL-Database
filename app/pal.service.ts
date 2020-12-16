import { Injectable } from '@angular/core';
import { AngularFireDatabase} from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { map } from '../../node_modules/rxjs/operators';


import { Child } from './interfaces/child.interface';

@Injectable({
  providedIn: 'root'
})
export class PALService{
  // Children:any;
  Children:Child | Child[] = {
    firstName: 'Name',
    lastName: 'Name'
  };

  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage) {}

  getDBSummaries(){
    return this.db.list('Summary').valueChanges();
  }

  getDbChildren(){
    return this.db.object('Children').valueChanges()
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

getChild(id: string){
  return this.db.object('Children/'+id).valueChanges()
    .pipe(
      map((responseData:any)=>{
        const ChildData:Child[] = [];
        ChildData.push(responseData)
        console.log('Child wit id', ChildData);
        return ChildData;
      })
    );
}

getProfileUrl(ref: any){
  const profileImgRef = this.storage.ref('Children/'+ref);
  // this.profileUrl =  ref.getDownloadURL();
  console.log('ref ===', ref);
  return console.log('retrieved url ====', profileImgRef.getDownloadURL());
}

}
