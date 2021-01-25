import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ManagementService } from '../management.service';
import { ManagementMember } from './../../interfaces/management-member.interface'

@Component({
  selector: 'app-management-list',
  templateUrl: './management-list.component.html',
  styleUrls: ['./management-list.component.css']
})
export class ManagementListComponent implements OnInit {

  isFetching: boolean = true;
  Members:Observable<ManagementMember[]>;
  searchText = '';


  constructor(private managementService: ManagementService) { }

  ngOnInit(): void {
    this.isFetching = true;
    this.Members = this.managementService.getMamangementData();
    this.isFetching = false;
  }




}
