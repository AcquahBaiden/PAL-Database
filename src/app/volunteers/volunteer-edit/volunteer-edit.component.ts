import { Component, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';

import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { VolunteersService } from '../volunteers.service';

import { switchMap, tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-volunteer-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './volunteer-edit.component.html',
  styleUrls: ['./volunteer-edit.component.css']
})
export class VolunteerEditComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute, 
    private volunteersService: VolunteersService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  @ViewChild('editForm', { static: false }) editForm!: NgForm;
  volId: string = '';
  selectedVol: Volunteer;
  volSubscription!: Subscription;
  dataLoaded = false;
  isUploading = false;
  uploadPercent: Observable<number | undefined>;

  ngOnInit(): void {
    this.volSubscription = this.route.params.pipe(
      tap(params => {
        this.volId = params['id'];
        this.dataLoaded = false;
        this.cdr.detectChanges();
      }),
      switchMap(params => this.volunteersService.getVolunteer(params['id']))
    ).subscribe(volunteer => {
      if (volunteer) {
        this.selectedVol = volunteer;
        this.dataLoaded = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          if (this.editForm) {
            this.editForm.form.patchValue({
              firstName: volunteer.firstName,
              lastName: volunteer.lastName,
              email: volunteer.email || '',
              telephone: volunteer.telephone || '',
              residence: volunteer.residence || '',
              level: volunteer.level || '',
              school: volunteer.school || '',
              program: volunteer.program || ''
            });
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  async onUpdateVolunteer(form: NgForm) {
    if (form.valid) {
      await this.volunteersService.updateVolunteer(this.volId, form.value);
      await this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  async onuploadProfileImg(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    const fileName = `vol_${this.selectedVol.firstName}_${this.selectedVol.lastName}_${Date.now()}`;
    this.cdr.detectChanges();

    try {
      const uploadPromise = this.volunteersService.uploadFile(event, fileName);
      this.uploadPercent = this.volunteersService.uploadPercent;
      this.cdr.detectChanges();

      await uploadPromise;
      await this.volunteersService.updateVolunteerProfilePhoto(this.volId, fileName);
    } finally {
      this.isUploading = false;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.volSubscription) {
      this.volSubscription.unsubscribe();
    }
  }
}
