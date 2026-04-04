import { Injectable, inject } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

import { map } from 'rxjs/operators';
import { Child } from './interfaces/child.interface';
import { Summary } from './interfaces/summary.interface';

@Injectable({
  providedIn: 'root'
})
export class PALService{
  // Children:any;
  Children:Child | Child[] = {
    firstName: 'Name',
    lastName: 'Name'
  };

  private db = inject(AngularFireDatabase);

  constructor() {}

  getDBSummaries() {
    return this.db.object('Summary').valueChanges();
  }


}

