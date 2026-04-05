import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';

import { SessionStore } from '../../auth/session.store';
import { ChildrenService } from '../../children/children.service';
import { Child } from '../../interfaces/child.interface';
import { ArchivedRecord } from '../../interfaces/profile-history.interface';
import { Volunteer } from '../../interfaces/volunteer.interface';
import { PaginationControlsComponent } from '../../shared/pagination-controls/pagination-controls.component';
import { SharedModule } from '../../shared/shared.module';
import { VolunteersService } from '../../volunteers/volunteers.service';

type ArchivedFilter = 'all' | 'child' | 'volunteer';

@Component({
  selector: 'app-archived-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, PaginationControlsComponent],
  templateUrl: './archived-list.component.html',
  styleUrls: ['./archived-list.component.css']
})
export class ArchivedListComponent implements OnInit, OnDestroy {
  isFetching = true;
  searchText = '';
  selectedFilter: ArchivedFilter = 'all';
  archivedRecords: ArchivedRecord[] = [];
  availableFilters: ArchivedFilter[] = ['all'];
  page = 1;
  pageSize = 10;

  private sub!: Subscription;

  constructor(
    private childrenService: ChildrenService,
    private volunteersService: VolunteersService,
    private sessionStore: SessionStore,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = combineLatest([
      this.childrenService.getArchivedChildren(),
      this.volunteersService.getArchivedVolunteers(),
      this.sessionStore.permissions$
    ]).subscribe({
      next: ([children, volunteers, permissions]) => {
        const archivedChildren = permissions?.children ? children.map((child) => this.toChildRecord(child)) : [];
        const archivedVolunteers = permissions?.volunteers ? volunteers.map((volunteer) => this.toVolunteerRecord(volunteer)) : [];

        this.availableFilters = ['all'];
        if (permissions?.children) {
          this.availableFilters.push('child');
        }
        if (permissions?.volunteers) {
          this.availableFilters.push('volunteer');
        }

        if (!this.availableFilters.includes(this.selectedFilter)) {
          this.selectedFilter = this.availableFilters[0];
        }

        this.archivedRecords = [...archivedChildren, ...archivedVolunteers].sort(
          (left, right) => right.archivedAt - left.archivedAt
        );
        this.ensureValidPage();
        this.isFetching = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching archived records:', error);
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredRecords(): ArchivedRecord[] {
    const search = this.searchText.trim().toLowerCase();

    return this.archivedRecords.filter((record) => {
      const matchesFilter = this.selectedFilter === 'all' || record.type === this.selectedFilter;
      const profile = record.profile as Child | Volunteer;
      const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim().toLowerCase();
      return matchesFilter && (!search || fullName.includes(search));
    });
  }

  get paginatedRecords(): ArchivedRecord[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredRecords.slice(start, start + this.pageSize);
  }

  onSearchChange(): void {
    this.page = 1;
  }

  onFilterChange(): void {
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
    this.sub?.unsubscribe();
  }

  private ensureValidPage(): void {
    const totalPages = Math.max(1, Math.ceil(this.filteredRecords.length / this.pageSize));
    if (this.page > totalPages) {
      this.page = totalPages;
    }
  }

  private toChildRecord(child: Child): ArchivedRecord<Child> {
    return {
      id: child.id || '',
      type: 'child',
      archivedAt: child.archivedAt || 0,
      archivedReason: child.archivedReason || 'Archived',
      archivedReasonDetail: child.archivedReasonDetail,
      profile: child
    };
  }

  private toVolunteerRecord(volunteer: Volunteer): ArchivedRecord<Volunteer> {
    return {
      id: volunteer.id || '',
      type: 'volunteer',
      archivedAt: volunteer.archivedAt || 0,
      archivedReason: volunteer.archivedReason || 'Archived',
      archivedReasonDetail: volunteer.archivedReasonDetail,
      profile: volunteer
    };
  }
}
