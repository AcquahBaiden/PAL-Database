import { Injectable } from '@angular/core';
import { AngularFireDatabase} from '@angular/fire/database';
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
  selectedChild: Child = {firstName: 'firstName', lastName: 'lastName'};
  constructor(private db: AngularFireDatabase) {}

  getDBSummaries(){
    return this.db.list('Summary').valueChanges();
  }
  // getDbChildren(){
  //   return this.db.list('Children').valueChanges();
  //   // return this.Children;
  // }
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

}
