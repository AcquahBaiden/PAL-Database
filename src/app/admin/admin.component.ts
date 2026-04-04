import { Component, OnInit } from '@angular/core';
import { AdminServiceService } from './admin-service.service';

import { tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AdminFilterPipe } from './admin.pipe';
import { AccessControlComponent } from './access-control/access-control.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, AdminFilterPipe, AccessControlComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private adminService: AdminServiceService) { }
  isFetching = true
  usersAccessList: any;
  searchText = '';

  ngOnInit(): void {
   this.usersAccessList = this.adminService.getUsersAccessInfo().pipe(
     tap(() => this.isFetching = false)
   );
  }
}
