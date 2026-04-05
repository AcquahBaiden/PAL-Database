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
    const [childrenSnapshot, volunteersSnapshot, managementSnapshot, usersSnapshot] = await Promise.all([
      get(ref(this.db, 'Children')),
      get(ref(this.db, 'Volunteers')),
      get(ref(this.db, 'Management')),
      get(ref(this.db, 'Access'))
    ]);

    const children = (childrenSnapshot.val() ?? {}) as Record<string, Child>;
    const volunteers = (volunteersSnapshot.val() ?? {}) as Record<string, { archived?: boolean }>;
    const management = (managementSnapshot.val() ?? {}) as Record<string, unknown>;
    const users = (usersSnapshot.val() ?? {}) as Record<string, unknown>;

    return {
      children: {
        number: Object.values(children).filter((child) => !child?.archived).length
      },
      volunteers: {
        number: Object.values(volunteers).filter((volunteer) => !volunteer?.archived).length
      },
      management: {
        number: Object.keys(management).length
      },
      DatabaseUsers: {
        number: Object.keys(users).length
      }
    };
  }
}
