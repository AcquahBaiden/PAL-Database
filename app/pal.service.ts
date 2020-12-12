import { Injectable } from '@angular/core';
import { Summary } from './interfaces/summary.interface';


@Injectable({
  providedIn: 'root'
})
export class PALService {
  mockSummary:Summary[]=[
    {
      category: 'children', number: 300
    },{
      category: 'volunteers', number: 130
    },{
      category: 'management', number: 14
    },{
      category: 'users', number: 5
    }

  ]
  constructor() { }
  getSummaries(){
    return this.mockSummary;
  }
}
