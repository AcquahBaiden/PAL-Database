import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { PALService } from '../pal.service';



@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  Summary: any;
  isFetching: boolean = true;
  summarySubscription: Subscription;
  constructor(private palservice: PALService) {  }

  ngOnInit(): void {
   this.Summary = this.palservice.getDBSummaries();
  }

}
