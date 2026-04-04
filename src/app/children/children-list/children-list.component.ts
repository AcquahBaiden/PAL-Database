import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FilterPipe } from '../filter.pipe';

@Component({
  selector: 'app-children-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, FilterPipe],
  templateUrl: './children-list.component.html',
  styleUrls: ['./children-list.component.css']
})
export class ChildrenListComponent implements OnInit, OnDestroy {
  isFetching = true;
  searchText = '';
  childrenData: Child[] = [];
  private sub!: Subscription;

  constructor(private childrenService: ChildrenService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.sub = this.childrenService.getDbChildren().subscribe({
      next: (data) => {
        this.childrenData = data;
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

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
