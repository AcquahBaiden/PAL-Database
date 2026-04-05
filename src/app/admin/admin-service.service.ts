import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { Database, ref, objectVal, update } from '@angular/fire/database';
import { normalizeAccessData } from '../auth/access.utils';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  private db = inject(Database);

  getUsersAccessInfo(){
    return objectVal(ref(this.db, 'Access')).pipe(
      map((responseData: any) => {
        const accessData: any = [];
        if (!responseData) {
          return accessData;
        }

        for (const key in responseData) {
          if (responseData.hasOwnProperty(key)) {
            accessData.push({
              ...normalizeAccessData(responseData[key]),
              id: key
            });
          }
        }
        return accessData;
      })
    );
  }

  updateAccessToChildren(id: string, value: boolean){
    update(ref(this.db, `Access/${id}`), { children: !value });
  }
  updateAccessToVolunteers(id: string, value: boolean){
    update(ref(this.db, `Access/${id}`), { volunteers: !value });
  }
  updateAccessToManagement(id: string, value: boolean){
    update(ref(this.db, `Access/${id}`), { management: !value });
  }
  updateBasicAccess(id: string, value: boolean){
    update(ref(this.db, `Access/${id}`), { basic: !value });
  }
}
