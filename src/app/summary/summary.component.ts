import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class SummaryComponent implements OnInit {

  Summary: Summary[] = [];
  isFetching = true;
  private readonly categoryOrder = ['children', 'volunteers', 'management', 'DatabaseUsers'];

  constructor(private palService: PALService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    try {
      const summaryData = await this.palService.getDBSummaries();
      this.Summary = this.normalizeSummary(summaryData as SummaryResponse);
    } catch (err) {
      console.error('[Summary] Error fetching Summary data:', err);
      this.Summary = [];
    } finally {
      this.isFetching = false;
      this.cdr.detectChanges();
    }
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

}


