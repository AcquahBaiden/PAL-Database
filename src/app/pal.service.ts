import { Injectable, inject } from '@angular/core';
import { Database, ref, objectVal } from '@angular/fire/database';

import { Child } from './interfaces/child.interface';

@Injectable({
  providedIn: 'root'
})
export class PALService{
  Children:Child | Child[] = {
    firstName: 'Name',
    lastName: 'Name'
  };

  private db = inject(Database);

  getDBSummaries() {
    return objectVal(ref(this.db, 'Summary'));
  }
}
