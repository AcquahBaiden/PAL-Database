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
  // accesses:any;

  ngOnInit(): void {
    // this.authService.auth.onAuthStateChanged(user=>{
    //   if(user){
    //     this.accesses = this.authService.getUserAccessFromDatabase(user.uid);
    //   }
    // })
   this.usersAccessList = this.adminService.getUsersAccessInfo();
   this.isFetching = false;
  }

}
