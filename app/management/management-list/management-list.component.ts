import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/internal/operators/map';
import { ManagementService } from '../management.service';

import { ManagementMember } from './../../interfaces/management-member.interface'

@Component({
  selector: 'app-management-list',
  templateUrl: './management-list.component.html',
  styleUrls: ['./management-list.component.css']
})
export class ManagementListComponent implements OnInit {

  isFetching: boolean = true;
  Members:any;

  constructor(private managementService: ManagementService) { }

  ngOnInit(): void {
    this.isFetching = true;
    this.Members = this.managementService.getMamangementData()
              .pipe(
                map((responseData:any)=>{
                  const MembersData: ManagementMember[]=[];
                  for(const key in responseData){
                    if(responseData.hasOwnProperty(key)){
                      MembersData.push({...responseData[key], id: key})
                    }
                  }
                  return MembersData
                }
              )
              );
    this.isFetching = false;

  }


}
