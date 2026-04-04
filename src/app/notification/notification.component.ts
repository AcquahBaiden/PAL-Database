import { Component, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit {
  showStatus = false;
  isError = false;
  message = '';
  private timeout: any;

  constructor(private notiService: NotificationService) { }

  ngOnInit(): void {
    this.notiService.currentState.subscribe(stateData => {
      if (stateData.showStatus) {
        this.setStatus(stateData.isError, stateData.message);
      } else {
        this.reset();
      }
    });
  }

  reset() {
    this.showStatus = false;
    this.message = '';
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  setStatus(isError: boolean, message: string) {
    this.reset();
    this.isError = isError;
    this.message = message;
    this.showStatus = true;

    // Auto-dismiss after 5 seconds
    this.timeout = setTimeout(() => {
      this.showStatus = false;
    }, 5000);
  }
}
