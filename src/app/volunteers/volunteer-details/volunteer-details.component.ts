import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';

import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { VolunteersService } from '../volunteers.service';

import { switchMap, tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-volunteer-details',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './volunteer-details.component.html',
  styleUrls: ['./volunteer-details.component.css']
})
export class VolunteerDetailsComponent implements OnInit, OnDestroy {
  selectedVolunteer: Volunteer;
  volunteerId: string = '';
  volunteerSubscription!: Subscription;
  dataLoaded = false;
  addressLines: string[] = [];
  programs: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private volunteersService: VolunteersService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.volunteerSubscription = this.route.params.pipe(
      tap(params => {
        this.volunteerId = params['id'];
        this.dataLoaded = false;
        this.addressLines = [];
        this.programs = [];
        this.cdr.detectChanges();
      }),
      switchMap(params => this.volunteersService.getVolunteer(params['id']))
    ).subscribe(volunteer => {
      this.selectedVolunteer = volunteer;
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

  onDeleteVolunteer() {
    if (confirm('Are you sure you want to delete this volunteer profile?')) {
      this.volunteersService.deleteVolunteer(this.volunteerId);
      this.router.navigate(['volunteers']);
    }
  }

  ngOnDestroy() {
    if (this.volunteerSubscription) {
      this.volunteerSubscription.unsubscribe();
    }
  }
}
