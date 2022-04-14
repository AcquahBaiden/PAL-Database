import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  constructor() { }

  // getUsersAccessInfo():Observable<any>{
  //   let accessInfo = [
  //     {"Basic" : {
  //       "access" : true
  //     }},
  //     {"Children" : {
  //       "access" : true
  //     }},
  //    { "Management" : {
  //       "access" : true
  //     }},
  //     {"Volunteers" : {
  //       "access" : true
  //     }}
  //   ]
  //     return of(accessInfo)

  // }


}
