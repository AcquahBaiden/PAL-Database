import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, TemplateRef, ViewChild, inject } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { ProfileVersion } from '../../interfaces/profile-history.interface';

interface DisplayItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-profile-history',
  standalone: true,
  imports: [CommonModule, NgbModalModule, DatePipe],
  templateUrl: './profile-history.component.html',
  styleUrls: ['./profile-history.component.css']
})
export class ProfileHistoryComponent {
  @Input() title = 'Profile History';
  @Input() emptyMessage = 'No previous updates recorded yet.';
  @Input() versions: ProfileVersion<unknown>[] = [];

  @ViewChild('historyModal', { static: true }) historyModal!: TemplateRef<unknown>;

  selectedVersion: ProfileVersion<unknown> | null = null;

  private modal = inject(NgbModal);

  openVersion(version: ProfileVersion<unknown>): void {
    this.selectedVersion = version;
    this.modal.open(this.historyModal, { size: 'lg', centered: true, scrollable: true });
  }

  get selectedVersionFields(): DisplayItem[] {
    if (!this.selectedVersion) {
      return [];
    }

    return this.flattenValue(this.selectedVersion.profile);
  }

  private flattenValue(value: unknown, prefix = ''): DisplayItem[] {
    if (Array.isArray(value)) {
      if (!value.length) {
        return prefix ? [{ label: prefix, value: 'Not provided' }] : [];
      }

      if (value.every((entry) => this.isPrimitive(entry))) {
        return prefix ? [{ label: prefix, value: value.map((entry) => this.formatPrimitive(entry)).join(', ') }] : [];
      }

      return value.flatMap((entry, index) => this.flattenValue(entry, `${prefix} ${index + 1}`.trim()));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).flatMap(([key, entryValue]) => {
        const label = prefix ? `${prefix} / ${this.formatLabel(key)}` : this.formatLabel(key);
        if (this.isPrimitive(entryValue)) {
          return [{ label, value: this.formatPrimitive(entryValue) }];
        }

        return this.flattenValue(entryValue, label);
      });
    }

    if (!prefix) {
      return [];
    }

    return [{ label: prefix, value: this.formatPrimitive(value) }];
  }

  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, (value) => value.toUpperCase());
  }

  private formatPrimitive(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }

    return String(value);
  }

  private isPrimitive(value: unknown): boolean {
    return value === null || value === undefined || typeof value !== 'object';
  }
}
