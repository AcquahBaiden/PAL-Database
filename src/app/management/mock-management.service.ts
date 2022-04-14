import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { ManagementMember } from "../interfaces/management-member.interface";

@Injectable({
  providedIn: 'root'
})

export class MockManagementService{
  getMamangementData():Observable<ManagementMember[]>{
    const data:ManagementMember[] = [
      {
        'firstName':'John',
      'lastName':'Mensah'
      },
      {
        'firstName':'John',
      'lastName':'Mensah'
      }
    ]
    return of(data)
  }

  getMember():Observable<ManagementMember>{
    const data:ManagementMember = {
      'firstName':'John',
      'lastName':'Mensah'
    }
    return of(data)
  }
}
