import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionStore } from '../auth/session.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    private router: Router,
    public sessionStore: SessionStore
  ) { }

  ngOnInit(): void {
  }

  onAddChild(){
    this.router.navigate(['add-child']);
  }

  onAddVolunteer(){
    this.router.navigate(['add-volunteer']);
  }

  onAddManagement(){
    this.router.navigate(['add-management-member']);
  }

}
