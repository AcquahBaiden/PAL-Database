import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AdminServiceService } from './admin-service.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private adminService: AdminServiceService, private authService: AuthService) { }
  isFetching:boolean = true
  usersAccessList:any;
  searchText = '';

  ngOnInit(): void {
   this.usersAccessList = this.adminService.getUsersAccessInfo();
   this.isFetching = false;
  }

}
