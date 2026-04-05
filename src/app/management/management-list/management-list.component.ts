import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ManagementService } from '../management.service';
import { ManagementMember } from './../../interfaces/management-member.interface'

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginationControlsComponent } from '../../shared/pagination-controls/pagination-controls.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-management-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, PaginationControlsComponent],
  templateUrl: './management-list.component.html',
  styleUrls: ['./management-list.component.css']
})
export class ManagementListComponent implements OnInit, OnDestroy {
  isFetching = true;
  searchText = '';
  managementData: ManagementMember[] = [];
  page = 1;
  pageSize = 10;
  private sub!: Subscription;

  constructor(private managementService: ManagementService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.sub = this.managementService.getMamangementData().subscribe({
      next: (data) => {
        this.managementData = data;
        this.ensureValidPage();
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

  get filteredManagement(): ManagementMember[] {
    const search = this.searchText.trim().toLowerCase();

    return this.managementData.filter((member) => {
      if (!search) {
        return true;
      }

      return `${member.firstName || ''} ${member.lastName || ''}`.trim().toLowerCase().includes(search);
    });
  }

  get paginatedManagement(): ManagementMember[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredManagement.slice(start, start + this.pageSize);
  }

  onSearchChange(): void {
    this.page = 1;
  }

  onPageChange(page: number): void {
    this.page = page;
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.page = 1;
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private ensureValidPage(): void {
    const totalPages = Math.max(1, Math.ceil(this.filteredManagement.length / this.pageSize));
    if (this.page > totalPages) {
      this.page = totalPages;
    }
  }
}
