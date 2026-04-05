import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, combineLatest, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { SessionStore } from '../../auth/session.store';
import { ChildrenService } from '../../children/children.service';
import { Child } from '../../interfaces/child.interface';
import { ArchivedRecordType, ProfileVersion } from '../../interfaces/profile-history.interface';
import { Volunteer } from '../../interfaces/volunteer.interface';
import { ProfileHistoryComponent } from '../../shared/profile-history/profile-history.component';
import { SharedModule } from '../../shared/shared.module';
import { VolunteersService } from '../../volunteers/volunteers.service';

@Component({
  selector: 'app-archived-details',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule, ProfileHistoryComponent],
  templateUrl: './archived-details.component.html',
  styleUrls: ['./archived-details.component.css']
})
export class ArchivedDetailsComponent implements OnInit, OnDestroy {
  dataLoaded = false;
  recordType: ArchivedRecordType = 'child';
  childProfile: Child | null = null;
  volunteerProfile: Volunteer | null = null;
  childHistory: ProfileVersion<Child>[] = [];
  volunteerHistory: ProfileVersion<Volunteer>[] = [];
  hasPermission = true;
  addressLines: string[] = [];
  programs: string[] = [];

  private sub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private childrenService: ChildrenService,
    private volunteersService: VolunteersService,
    private sessionStore: SessionStore,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = this.route.params.pipe(
      tap((params) => {
        this.recordType = params['type'];
        this.dataLoaded = false;
        this.childProfile = null;
        this.volunteerProfile = null;
        this.childHistory = [];
        this.volunteerHistory = [];
        this.addressLines = [];
        this.programs = [];
      }),
      switchMap((params) =>
        this.sessionStore.permissions$.pipe(
          switchMap((permissions) => {
            const type = params['type'] as ArchivedRecordType;
            const id = params['id'] as string;
            const allowed = type === 'child' ? !!permissions?.children : !!permissions?.volunteers;
            this.hasPermission = allowed;

            if (!allowed) {
              return of(null);
            }

            return type === 'child'
              ? combineLatest([
                  this.childrenService.getChild(id),
                  this.childrenService.getChildProfileHistory(id)
                ])
              : combineLatest([
                  this.volunteersService.getVolunteer(id),
                  this.volunteersService.getVolunteerProfileHistory(id)
                ]);
          })
        )
      )
    ).subscribe({
      next: (result) => {
        if (this.recordType === 'child') {
          if (result) {
            const [child, history] = result as [Child, ProfileVersion<Child>[]];
            this.childProfile = child;
            this.childHistory = history;
          }
        } else {
          if (result) {
            const [volunteer, history] = result as [Volunteer, ProfileVersion<Volunteer>[]];
            this.volunteerProfile = volunteer;
            this.volunteerHistory = history;
            this.addressLines = volunteer.address ? Object.values(volunteer.address).filter((line) => !!line) : [];
            this.programs = volunteer.volunteeringInProg ? Object.values(volunteer.volunteeringInProg).filter((line) => !!line) : [];
          }
        }

        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading archived details:', error);
        this.dataLoaded = true;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get childInterestList(): string[] {
    if (Array.isArray(this.childProfile?.interests)) {
      return this.childProfile.interests;
    }

    return this.childProfile?.interests ? [this.childProfile.interests] : [];
  }
}
