import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';

import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { ProfileVersion } from 'src/app/interfaces/profile-history.interface';
import { VolunteersService } from '../volunteers.service';

import { switchMap, tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { ProfileHistoryComponent } from '../../shared/profile-history/profile-history.component';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-volunteer-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule, ProfileHistoryComponent, NgbModalModule],
  templateUrl: './volunteer-details.component.html',
  styleUrls: ['./volunteer-details.component.css']
})
export class VolunteerDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('archiveModal', { static: true }) archiveModal!: TemplateRef<unknown>;

  selectedVolunteer!: Volunteer;
  volunteerId: string = '';
  volunteerSubscription!: Subscription;
  dataLoaded = false;
  addressLines: string[] = [];
  programs: string[] = [];
  history: ProfileVersion<Volunteer>[] = [];
  archiveReason = 'Finished exchange';
  otherArchiveReason = '';
  readonly archiveReasonOptions = ['Finished exchange', 'Graduated', 'Other'];

  constructor(
    private route: ActivatedRoute,
    private volunteersService: VolunteersService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.volunteerSubscription = this.route.params.pipe(
      tap(params => {
        this.volunteerId = params['id'];
        this.dataLoaded = false;
        this.addressLines = [];
        this.programs = [];
        this.history = [];
        this.cdr.detectChanges();
      }),
      switchMap(params => combineLatest([
        this.volunteersService.getVolunteer(params['id']),
        this.volunteersService.getVolunteerProfileHistory(params['id'])
      ]))
    ).subscribe(([volunteer, history]) => {
      this.selectedVolunteer = volunteer;
      this.history = history;
      if (volunteer) {
        if (volunteer.address) {
          this.addressLines = Object.values(volunteer.address).filter(line => !!line);
        }
        if (volunteer.volunteeringInProg) {
          this.programs = Object.values(volunteer.volunteeringInProg).filter(prog => !!prog);
        }
      }
      this.dataLoaded = true;
      this.cdr.detectChanges();
    });
  }

  openArchiveModal(): void {
    this.archiveReason = 'Finished exchange';
    this.otherArchiveReason = '';
    this.modalService.open(this.archiveModal, { centered: true });
  }

  async confirmArchive(modal: { close: () => void }): Promise<void> {
    const reasonDetail = this.archiveReason === 'Other' ? this.otherArchiveReason.trim() : undefined;
    if (this.archiveReason === 'Other' && !reasonDetail) {
      return;
    }

    await this.volunteersService.archiveVolunteer(this.volunteerId, this.archiveReason, reasonDetail);
    modal.close();
    await this.router.navigate(['/archived', 'volunteer', this.volunteerId]);
  }

  ngOnDestroy() {
    if (this.volunteerSubscription) {
      this.volunteerSubscription.unsubscribe();
    }
  }
}
