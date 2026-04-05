import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { VolunteersService } from '../volunteers.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginationControlsComponent } from '../../shared/pagination-controls/pagination-controls.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-volunteer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, PaginationControlsComponent],
  templateUrl: './volunteer-list.component.html',
  styleUrls: ['./volunteer-list.component.css']
})
export class VolunteerListComponent implements OnInit, OnDestroy {
  isFetching = true;
  searchText = '';
  volunteersData: Volunteer[] = [];
  page = 1;
  pageSize = 10;
  private sub!: Subscription;

  constructor(private volunteersService: VolunteersService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.sub = this.volunteersService.getVolunteersData().subscribe({
      next: (data) => {
        this.volunteersData = data;
        this.ensureValidPage();
        this.isFetching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching volunteers:', err);
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredVolunteers(): Volunteer[] {
    const search = this.searchText.trim().toLowerCase();

    return this.volunteersData.filter((volunteer) => {
      if (!search) {
        return true;
      }

      return `${volunteer.firstName || ''} ${volunteer.lastName || ''}`.trim().toLowerCase().includes(search);
    });
  }

  get paginatedVolunteers(): Volunteer[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredVolunteers.slice(start, start + this.pageSize);
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
    const totalPages = Math.max(1, Math.ceil(this.filteredVolunteers.length / this.pageSize));
    if (this.page > totalPages) {
      this.page = totalPages;
    }
  }
}
