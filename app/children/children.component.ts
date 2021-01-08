import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { PALService } from '../pal.service';

@Component({
  selector: 'app-children',
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.css']
})
export class ChildrenComponent implements OnInit {
  accesses:any;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  this.authService.auth.onAuthStateChanged(user=>{
    if(user){
      this.accesses = this.authService.getUserAccessFromDatabase(user.uid);
    }
  })
  }


}
