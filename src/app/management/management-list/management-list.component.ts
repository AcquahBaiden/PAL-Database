import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { ManagementService } from '../management.service';
import { ManagementMember } from './../../interfaces/management-member.interface'

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ManagersFilterPipe } from '../management.pipe';

@Component({
  selector: 'app-management-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, ManagersFilterPipe],
  templateUrl: './management-list.component.html',
  styleUrls: ['./management-list.component.css']
})
export class ManagementListComponent implements OnInit, OnDestroy {
  isFetching = true;
  searchText = '';
  managementData: ManagementMember[] = [];
  private sub!: Subscription;

  constructor(private managementService: ManagementService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.sub = this.managementService.getMamangementData().subscribe({
      next: (data) => {
        this.managementData = data;
        this.isFetching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching management:', err);
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
