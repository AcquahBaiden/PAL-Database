import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { ManagementMember } from 'src/app/interfaces/management-member.interface';
import { ManagementService } from '../management.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../notification/notification.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-add-management-member',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './add-management-member.component.html',
  styleUrls: ['./add-management-member.component.css']
})
export class AddManagementMemberComponent implements OnInit {

  @ViewChild('M') addMamangementMemberForm!: NgForm;
  imgUploadPercent: Observable<number | undefined>;
  imgDownloadURL: Observable<string>;
  isUploading = false;
  imageFileName: string = '';

  constructor(
    private managementService: ManagementService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  async onSaveMember(form: NgForm) {
    const val = form.value;
    const newMember: ManagementMember = {
      firstName: val.firstName,
      lastName: val.lastName,
      position: val.position,
      email: val.email,
      telephone: val.telephone,
      residence: val.residence,
      description: val.description,
      img: this.imageFileName || undefined
    };

    await this.managementService.saveToFirebase(newMember);
    this.addMamangementMemberForm.reset();
    this.imageFileName = '';
    this.imgDownloadURL = new Observable<string>();
  }

  async onuploadProfileImg(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    const firstName = this.addMamangementMemberForm.value.firstName || 'management';
    const lastName = this.addMamangementMemberForm.value.lastName || 'profile';
    const fileName = `mgmt_${firstName}_${lastName}_${Date.now()}`;
    this.cdr.detectChanges();

    try {
      const uploadPromise = this.managementService.uploadFile(event, fileName);
      this.imgUploadPercent = this.managementService.uploadPercent;
      this.cdr.detectChanges();

      await uploadPromise;
      this.imageFileName = fileName;
      this.imgDownloadURL = this.managementService.downloadURL;
    } catch (error) {
      console.error('Error uploading management profile photo:', error);
      this.imageFileName = '';
      this.imgDownloadURL = new Observable<string>();
      this.notificationService.setState(true, 'Profile photo upload failed. The member profile will be saved without a photo unless upload succeeds.', true);
    } finally {
      this.isUploading = false;
      this.cdr.detectChanges();
    }
  }
}
