import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css']
})
export class ManagementComponent implements OnInit {

  constructor(private authService: AuthService) { }
  accesses:any;
  ngOnInit(): void {
    this.authService.auth.onAuthStateChanged(user=>{
      if(user){
        this.accesses = this.authService.getUserAccessFromDatabase(user.uid);
      }
    })
  }

}
