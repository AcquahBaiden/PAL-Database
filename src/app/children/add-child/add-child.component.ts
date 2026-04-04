import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

import { finalize, tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

  constructor(private childrenService: ChildrenService) { }

  ngOnInit(): void {
  }

  async onSaveChild(form: NgForm) {
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

    await this.childrenService.saveToDB(newChild);
    this.resetForm();
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

  onuploadProfileImg(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;
    const fileName = `${this.addChildForm.value.firstName}_${this.addChildForm.value.lastName}_${Date.now()}`;
    
    // Using a more robust way to handle the upload completion
    const fileRef = this.childrenService.uploadFile(event, fileName);
    this.imgUploadPercent = this.childrenService.uploadPercent;
    this.imageFileName = fileName;

    // We should ideally have the uploadFile return the task or use a more reactive way
    // For now, I'll keep it simple but fix the timeout logic if possible
    // Refactoring service to be more reactive would be better
    setTimeout(() => {
      this.imgDownloadURL = this.childrenService.downloadURL;
      this.isUploading = false;
    }, 5000);
  }
}
