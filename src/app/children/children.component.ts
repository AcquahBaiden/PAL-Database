import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChildrenListComponent } from './children-list/children-list.component';

@Component({
  selector: 'app-children',
  standalone: true,
  imports: [CommonModule, RouterModule, ChildrenListComponent],
  templateUrl: './children.component.html',
  styleUrls: ['./children.component.css']
})
export class ChildrenComponent implements OnInit {
  // accesses:any;
  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  // this.authService.auth.onAuthStateChanged(user=>{
  //   if(user){
  //     this.accesses = this.authService.getUserAccessFromDatabase(user.uid);
  //   }
  // })
  }


}
