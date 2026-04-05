import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

import { Summary } from '../interfaces/summary.interface';
import { PALService } from '../pal.service';

type SummaryValue = { number?: number } | number | null;
type SummaryResponse = Record<string, SummaryValue> | null;

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit, OnDestroy {
  Summary: Summary[] = [];
  isFetching = true;
  private sub!: Subscription;
  private readonly categoryOrder = ['children', 'volunteers', 'management', 'DatabaseUsers'];

  constructor(private palService: PALService) {
  }

  ngOnInit(): void {
    this.sub = this.palService.getDBSummaries().subscribe({
      next: (summaryData) => {
        this.Summary = this.normalizeSummary(summaryData as SummaryResponse);
        this.isFetching = false;
      },
      error: (err: any) => {
        console.error('Error fetching Summary data:', err);
        this.Summary = [];
        this.isFetching = false;
      }
    });
  }

  private normalizeSummary(summaryData: SummaryResponse): Summary[] {
    if (!summaryData) {
      return [];
    }

    return Object.entries(summaryData)
      .map(([category, value]) => ({
        category,
        number: this.getSummaryNumber(value)
      }))
      .sort((left, right) => this.getCategoryIndex(left.category) - this.getCategoryIndex(right.category));
  }

  private getSummaryNumber(value: SummaryValue): number {
    if (typeof value === 'number') {
      return value;
    }

    if (value && typeof value === 'object' && 'number' in value) {
      const numberValue = Number(value.number ?? 0);
      return Number.isFinite(numberValue) ? numberValue : 0;
    }

    return 0;
  }

  private getCategoryIndex(category: string): number {
    const index = this.categoryOrder.indexOf(category);
    return index === -1 ? this.categoryOrder.length : index;
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}


