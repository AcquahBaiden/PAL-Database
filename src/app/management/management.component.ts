import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManagementListComponent } from './management-list/management-list.component';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [CommonModule, RouterModule, ManagementListComponent],
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css']
})
export class ManagementComponent implements OnInit {

  constructor() { }
  // accesses:any;
  ngOnInit(): void {
    // this.authService.auth.onAuthStateChanged(user=>{
    //   if(user){
    //     this.accesses = this.authService.getUserAccessFromDatabase(user.uid);
    //   }
    // })
  }

}
