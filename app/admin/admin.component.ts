import { Component, OnInit } from '@angular/core';
import { AdminServiceService } from './admin-service.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private adminService: AdminServiceService) { }
  isFetching:boolean = true
  userAccessList:any;

  ngOnInit(): void {
   this.userAccessList = this.adminService.getUsersAccessInfo();
   this.isFetching = false;
  }

}
