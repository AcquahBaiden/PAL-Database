import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaginationControlsComponent } from '../../shared/pagination-controls/pagination-controls.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-children-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, PaginationControlsComponent],
  templateUrl: './children-list.component.html',
  styleUrls: ['./children-list.component.css']
})
export class ChildrenListComponent implements OnInit, OnDestroy {
  isFetching = true;
  searchText = '';
  childrenData: Child[] = [];
  page = 1;
  pageSize = 10;
  private sub!: Subscription;

  constructor(private childrenService: ChildrenService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.sub = this.childrenService.getDbChildren().subscribe({
      next: (data) => {
        this.childrenData = data;
        this.ensureValidPage();
        this.isFetching = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching children:', err);
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredChildren(): Child[] {
    const search = this.searchText.trim().toLowerCase();

    return this.childrenData.filter((child) => {
      if (!search) {
        return true;
      }

      return `${child.firstName || ''} ${child.lastName || ''}`.trim().toLowerCase().includes(search);
    });
  }

  get paginatedChildren(): Child[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredChildren.slice(start, start + this.pageSize);
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
    const totalPages = Math.max(1, Math.ceil(this.filteredChildren.length / this.pageSize));
    if (this.page > totalPages) {
      this.page = totalPages;
    }
  }
}
