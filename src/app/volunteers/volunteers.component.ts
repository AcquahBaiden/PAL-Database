import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VolunteerListComponent } from './volunteer-list/volunteer-list.component';

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [CommonModule, RouterModule, VolunteerListComponent],
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.css']
})
export class VolunteersComponent implements OnInit {
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
