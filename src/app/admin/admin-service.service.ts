import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

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
    this.db.list(ref).set('children', !value);
    this.db.list(ref+'/Children/').set('access', !value);
  }
  updateAccessToVolunteers(id:string, value: boolean){
    const ref = 'Access/'.concat(id);
    this.db.list(ref).set('volunteers', !value);
    this.db.list(ref+'/Volunteers/').set('access', !value);

  }
  updateAccessToManagement(id:string, value: boolean){
    const ref = 'Access/'.concat(id);
    this.db.list(ref).set('management', !value);
    this.db.list(ref+'/Management/').set('access', !value);

  }

  updateBasicAccess(id:string, value:boolean){
    const ref = 'Access/'.concat(id);
    this.db.list(ref).set('basic', !value);
    this.db.list(ref+'/Basic/').set('access', !value);
  }
}
