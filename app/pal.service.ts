import { Injectable } from '@angular/core';
import { AngularFireDatabase} from '@angular/fire/database';
import { map } from 'rxjs/operators';


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

  constructor(private db: AngularFireDatabase) {}

  getDBSummaries(){
    return this.db.list('Summary').valueChanges();
  }


}
