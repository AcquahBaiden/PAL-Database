import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { Observable } from 'rxjs';
import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { VolunteersService } from '../volunteers.service';
import { NotificationService } from '../../notification/notification.service';

@Component({
  selector: 'app-add-volunteer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './add-volunteer.component.html',
  styleUrls: ['./add-volunteer.component.css']
})
export class AddVolunteerComponent implements OnInit {

  @ViewChild('v') addVolunteerForm!: NgForm;
  imgUploadPercent: Observable<number | undefined>;
  imgDownloadURL: Observable<string>;
  isUploading = false;
  imageFileName: string = '';

  constructor(
    private volunteersService: VolunteersService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  async onSaveVolunteer(form: NgForm) {
    const val = form.value;
    const newVolunteer: Volunteer = {
      firstName: val.firstName,
      lastName: val.lastName,
      email: val.email,
      telephone: val.telephone,
      residence: val.residence,
      level: val.level,
      school: val.school,
      program: val.program,
      address: {
        Line1: val.Line1,
        Line2: val.Line2,
        Line3: val.Line3
      },
      volunteeringInProg: {
        Prog1: val.Prog1,
        Prog2: val.Prog2,
        Prog3: val.Prog3
      },
      img: this.imageFileName || undefined
    };

    await this.volunteersService.saveToDB(newVolunteer);
    this.addVolunteerForm.reset();
    this.imageFileName = '';
    this.imgDownloadURL = new Observable<string>();
  }

  async onuploadProfileImg(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    const firstName = this.addVolunteerForm.value.firstName || 'volunteer';
    const lastName = this.addVolunteerForm.value.lastName || 'profile';
    const fileName = `vol_${firstName}_${lastName}_${Date.now()}`;
    this.cdr.detectChanges();

    try {
      const uploadPromise = this.volunteersService.uploadFile(event, fileName);
      this.imgUploadPercent = this.volunteersService.uploadPercent;
      this.cdr.detectChanges();

      await uploadPromise;
      this.imageFileName = fileName;
      this.imgDownloadURL = this.volunteersService.downloadURL;
    } catch (error) {
      console.error('Error uploading volunteer profile photo:', error);
      this.imageFileName = '';
      this.imgDownloadURL = new Observable<string>();
      this.notificationService.setState(true, 'Profile photo upload failed. The volunteer profile will be saved without a photo unless upload succeeds.', true);
    } finally {
      this.isUploading = false;
      this.cdr.detectChanges();
    }
  }
}
