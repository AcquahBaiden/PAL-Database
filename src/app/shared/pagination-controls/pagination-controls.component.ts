import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination-controls.component.html',
  styleUrls: ['./pagination-controls.component.css']
})
export class PaginationControlsComponent {
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() itemLabel = 'records';
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  readonly pageSizeOptions = [5, 10, 20, 50];

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get startItem(): number {
    if (!this.totalItems) {
      return 0;
    }

    return (this.page - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.page * this.pageSize, this.totalItems);
  }

  onPreviousPage(): void {
    if (this.page > 1) {
      this.pageChange.emit(this.page - 1);
    }
  }

  onNextPage(): void {
    if (this.page < this.totalPages) {
      this.pageChange.emit(this.page + 1);
    }
  }

  onPageSizeSelected(pageSize: string | number): void {
    this.pageSizeChange.emit(Number(pageSize));
  }
}
