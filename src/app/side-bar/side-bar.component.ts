import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionStore } from '../auth/session.store';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {

  @Input() isCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(public sessionStore: SessionStore) { }

  ngOnInit(): void {
  }

  onToggle() {
    this.toggleSidebar.emit();
  }

}
