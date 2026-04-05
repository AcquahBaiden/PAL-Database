import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../notification/notification.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-add-child',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedModule],
  templateUrl: './add-child.component.html',
  styleUrls: ['./add-child.component.css']
})
export class AddChildComponent implements OnInit {

  @ViewChild('f') addChildForm!: NgForm;
  imgUploadPercent: Observable<number | undefined>;
  imgDownloadURL: Observable<string>;
  isUploading = false;
  imageFileName: string = '';
  interests: string[] = [];
  programs: { program: string, year: string }[] = [];

  constructor(
    private childrenService: ChildrenService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  async onSaveChild(form: NgForm) {
    if (form.invalid) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      this.notificationService.setState(true, 'First name and last name are required before saving a child profile.', true);
      return;
    }

    if (this.isUploading) {
      this.notificationService.setState(true, 'Please wait for the profile photo upload to finish before saving.', true);
      return;
    }

    const formValue = form.value;
    const newChild: Child = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      residence: formValue.residence,
      telephone: formValue.telephone,
      class: formValue.class,
      school: formValue.school,
      parentName: formValue.parentName,
      parentTel: formValue.parentTel,
      description: formValue.description,
      interests: this.interests,
      programs: this.programs,
      img: this.imageFileName || undefined
    };

    const saved = await this.childrenService.saveToDB(newChild);
    if (saved) {
      this.resetForm();
    }
  }

  resetForm() {
    this.addChildForm.reset();
    this.interests = [];
    this.programs = [];
    this.imageFileName = '';
    this.imgDownloadURL = new Observable<string>();
  }

  onAddInterest(interestInput: any) {
    if (interestInput.value) {
      this.interests.push(interestInput.value);
      interestInput.control.reset();
    }
  }

  onRemoveInterest(index: number) {
    this.interests.splice(index, 1);
  }

  onAddProgram(programName: any, programYear: any) {
    if (programName.value && programYear.value) {
      this.programs.push({ program: programName.value, year: programYear.value });
      programName.control.reset();
      programYear.control.reset();
    }
  }

  onRemoveProgram(index: number) {
    this.programs.splice(index, 1);
  }

  async onuploadProfileImg(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    const firstName = this.addChildForm.value.firstName || 'child';
    const lastName = this.addChildForm.value.lastName || 'profile';
    const fileName = `${firstName}_${lastName}_${Date.now()}`;
    this.cdr.detectChanges();

    try {
      const uploadPromise = this.childrenService.uploadFile(event, fileName);
      this.imgUploadPercent = this.childrenService.uploadPercent;
      this.cdr.detectChanges();

      await uploadPromise;
      this.imageFileName = fileName;
      this.imgDownloadURL = this.childrenService.downloadURL;
    } catch (error) {
      console.error('Error uploading child profile photo:', error);
      this.imageFileName = '';
      this.imgDownloadURL = new Observable<string>();
      this.notificationService.setState(true, 'Profile photo upload failed. The child profile will be saved without a photo unless upload succeeds.', true);
    } finally {
      this.isUploading = false;
      this.cdr.detectChanges();
    }
  }
}
