import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-volunteers',
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.css']
})
export class VolunteersComponent implements OnInit {
  constructor(private authService: AuthService) { }
  // accesses:any;
  ngOnInit(): void {
    // this.authService.auth.onAuthStateChanged(user=>{
    //   if(user){
    //     this.accesses = this.authService.getUserAccessFromDatabase(user.uid);
    //   }
    // })
  }

}
