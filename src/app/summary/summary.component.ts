import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/compat/database';

import { tap, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit, OnDestroy {
  Summary: any[] = [];
  isFetching = true;
  private sub!: Subscription;
  private cdr = inject(ChangeDetectorRef);

  constructor(private db: AngularFireDatabase) { 
  }

  ngOnInit(): void {
    this.sub = this.db.list('Summary').snapshotChanges().subscribe({
      next: (changes) => {
        let mappedData = changes.map(c => ({
          category: c.payload.key,
          number: (c.payload.val() as any)?.number || 0
        }));

        this.Summary = mappedData;
        this.isFetching = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching Summary data:', err);
        this.Summary = [];
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



