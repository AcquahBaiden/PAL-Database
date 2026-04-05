import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

import { observeCollectionData, toFirestorePlainData } from '../shared/firestore-data.utils';
import { normalizeAccessData } from '../auth/access.utils';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  private firestore = inject(Firestore);
  private accessCollection = collection(this.firestore, 'access');

  getUsersAccessInfo() {
    return observeCollectionData<any>(this.accessCollection, { idField: 'id' }).pipe(
      map((responseData: any[]) =>
        responseData
          .map((item) => ({
            ...normalizeAccessData(item),
            id: item.id
          }))
          .sort((left, right) => (left.email || '').localeCompare(right.email || ''))
      )
    );
  }

  updateAccessToChildren(id: string, value: boolean) {
    return this.updateAccessField(id, 'children', !value);
  }

  updateAccessToVolunteers(id: string, value: boolean) {
    return this.updateAccessField(id, 'volunteers', !value);
  }

  updateAccessToManagement(id: string, value: boolean) {
    return this.updateAccessField(id, 'management', !value);
  }

  updateAccessToArchived(id: string, value: boolean) {
    return this.updateAccessField(id, 'archived', !value);
  }

  updateBasicAccess(id: string, value: boolean) {
    return this.updateAccessField(id, 'basic', !value);
  }

  private updateAccessField(id: string, field: string, nextValue: boolean) {
    return setDoc(doc(this.firestore, 'access', id), toFirestorePlainData({ [field]: nextValue }), { merge: true });
  }
}
