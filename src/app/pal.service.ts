import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getCountFromServer, query, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PALService {
  private firestore = inject(Firestore);

  async getDBSummaries() {
    const [childrenCount, volunteersCount, managementCount, usersCount] = await Promise.all([
      getCountFromServer(query(collection(this.firestore, 'children'), where('archived', '==', false))),
      getCountFromServer(query(collection(this.firestore, 'volunteers'), where('archived', '==', false))),
      getCountFromServer(collection(this.firestore, 'management')),
      getCountFromServer(collection(this.firestore, 'access'))
    ]);

    return {
      children: { number: childrenCount.data().count },
      volunteers: { number: volunteersCount.data().count },
      management: { number: managementCount.data().count },
      DatabaseUsers: { number: usersCount.data().count }
    };
  }
}
