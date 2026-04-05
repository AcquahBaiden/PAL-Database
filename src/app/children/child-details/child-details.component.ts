import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { ProfileVersion } from 'src/app/interfaces/profile-history.interface';
import { ChildrenService } from '../children.service';

import { switchMap, tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { ProfileHistoryComponent } from '../../shared/profile-history/profile-history.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-child-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, ProfileHistoryComponent, NgbModalModule],
  templateUrl: './child-details.component.html',
  styleUrls: ['./child-details.component.css']
})
export class ChildDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('archiveModal', { static: true }) archiveModal!: TemplateRef<unknown>;

  selectedChild!: Child;
  childId!: string;
  childSubscription!: Subscription;
  dataLoaded = false;
  history: ProfileVersion<Child>[] = [];
  archiveReason = 'Moved away';
  otherArchiveReason = '';
  readonly archiveReasonOptions = ['Moved away', 'No longer participating', 'Graduated', 'Other'];

  constructor(
    private route: ActivatedRoute,
    private childrenService: ChildrenService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.childSubscription = this.route.params.pipe(
      tap(params => {
        this.childId = params['id'];
        this.dataLoaded = false;
        this.history = [];
        this.cdr.detectChanges();
      }),
      switchMap(params => combineLatest([
        this.childrenService.getChild(params['id']),
        this.childrenService.getChildProfileHistory(params['id'])
      ]))
    ).subscribe(([child, history]) => {
      this.selectedChild = child;
      this.history = history;
      this.dataLoaded = true;
      this.cdr.detectChanges();
    });
  }

  get interestList(): string[] {
    if (Array.isArray(this.selectedChild?.interests)) {
      return this.selectedChild.interests;
    }

    return this.selectedChild?.interests ? [this.selectedChild.interests] : [];
  }

  openArchiveModal(): void {
    this.archiveReason = 'Moved away';
    this.otherArchiveReason = '';
    this.modalService.open(this.archiveModal, { centered: true });
  }

  async confirmArchive(modal: { close: () => void }): Promise<void> {
    const reasonDetail = this.archiveReason === 'Other' ? this.otherArchiveReason.trim() : undefined;
    if (this.archiveReason === 'Other' && !reasonDetail) {
      return;
    }

    await this.childrenService.archiveChild(this.childId, this.archiveReason, reasonDetail);
    modal.close();
    await this.router.navigate(['/archived', 'child', this.childId]);
  }

  ngOnDestroy(): void {
    if (this.childSubscription) {
      this.childSubscription.unsubscribe();
    }
  }
}
