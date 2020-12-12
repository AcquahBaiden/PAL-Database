import { Component, OnInit } from '@angular/core';

import { Summary } from '../interfaces/summary.interface';
import { PALService } from '../pal.service'


@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

  summaries!: Summary[];

  constructor(private palservice: PALService) { }

  ngOnInit(): void {
    this.summaries = this.palservice.getSummaries();

  }

}
