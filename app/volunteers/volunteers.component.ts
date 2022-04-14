import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-volunteers',
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
