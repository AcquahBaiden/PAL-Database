import { Injectable, inject } from '@angular/core';
import { Database } from '@angular/fire/database';
import { ref, get } from 'firebase/database';

import { Child } from './interfaces/child.interface';

@Injectable({
  providedIn: 'root'
})
export class PALService {
  Children: Child | Child[] = {
    firstName: 'Name',
    lastName: 'Name'
  };

  private db = inject(Database);

  async getDBSummaries() {
    const snapshot = await get(ref(this.db, 'Summary'));
    return snapshot.val();
  }
}
