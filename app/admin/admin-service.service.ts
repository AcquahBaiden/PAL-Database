import { Injectable } from '@angular/core';
import { map } from 'rxjs/internal/operators/map';

import { AngularFireDatabase } from '../../../node_modules/@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  constructor(private db: AngularFireDatabase) { }

  getUsersAccessInfo(){
    return this.db.object('Access').valueChanges()
      .pipe(
        map((responseData:any)=>{
          const accessData:any = [];
          for(const key in responseData){
            if(responseData.hasOwnProperty(key)){
              accessData.push({...responseData[key], id:key})
            }
          }
          return accessData;
        }
      ))
  }

  updateAccessToChildren(id:string, value: boolean){
    const ref = 'Access/'.concat(id);
    console.log(ref, value);
    console.log(ref, !value);
    this.db.list(ref).set('children', !value);
  }
  updateAccessToVolunteers(id:string, value: boolean){
    const ref = 'Access/'.concat(id);
    console.log(ref, value);
    console.log(ref, !value);
    this.db.list(ref).set('volunteers', !value);
  }
}
