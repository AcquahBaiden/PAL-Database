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
  private readonly dateFormatter = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });

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
        return prefix ? [{ label: prefix, value: value.map((entry) => this.formatPrimitive(entry, prefix)).join(', ') }] : [];
      }

      return value.flatMap((entry, index) => this.flattenValue(entry, `${prefix} ${index + 1}`.trim()));
    }

    if (value && typeof value === 'object') {
      return Object.entries(value as Record<string, unknown>).flatMap(([key, entryValue]) => {
        const label = prefix ? `${prefix} / ${this.formatLabel(key)}` : this.formatLabel(key);
        if (this.isPrimitive(entryValue)) {
          return [{ label, value: this.formatPrimitive(entryValue, label) }];
        }

        return this.flattenValue(entryValue, label);
      });
    }

    if (!prefix) {
      return [];
    }

    return [{ label: prefix, value: this.formatPrimitive(value, prefix) }];
  }

  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, (value) => value.toUpperCase());
  }

  private formatPrimitive(value: unknown, label = ''): string {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (this.isTimestampField(label) && typeof value === 'number' && Number.isFinite(value)) {
      return this.dateFormatter.format(new Date(value));
    }

    return String(value);
  }

  private isTimestampField(label: string): boolean {
    const normalizedLabel = label.trim().toLowerCase();
    return normalizedLabel.endsWith('created at')
      || normalizedLabel.endsWith('updated at')
      || normalizedLabel.endsWith('archived at')
      || normalizedLabel.endsWith('timestamp');
  }

  private isPrimitive(value: unknown): boolean {
    return value === null || value === undefined || typeof value !== 'object';
  }
}
