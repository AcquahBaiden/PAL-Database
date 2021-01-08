import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { VolunteersService } from '../volunteers.service';

@Component({
  selector: 'app-add-volunteer',
  templateUrl: './add-volunteer.component.html',
  styleUrls: ['./add-volunteer.component.css']
})
export class AddVolunteerComponent implements OnInit {

  @ViewChild('v') addVolunteerForm!: NgForm;
  newForm = new FormControl;
  submitted:boolean = false;
  newVolunteer: Volunteer={firstName:'', lastName:''};
  imgUploadPercent: Observable<number>;
  imgDownloadURL:Observable<string>;
  isUploading = false;
  imagePath: string = null;
  retrieving: boolean = false;

  constructor(private volunteersService: VolunteersService) { }

  ngOnInit(): void {
  }

  onSaveChild(form: NgForm){
    this.submitted = true;

    this.newVolunteer.firstName = this.addVolunteerForm.value.firstName;
    this.newVolunteer.lastName = this.addVolunteerForm.value.lastName;
    this.newVolunteer.residence = this.addVolunteerForm.value.residence;
    this.newVolunteer.telephone = this.addVolunteerForm.value.telephone;
    this.newVolunteer.school = this.addVolunteerForm.value.school;
    this.newVolunteer.program = this.addVolunteerForm.value.program;
    this.newVolunteer.level = this.addVolunteerForm.value.level;

    if(this.imagePath){
      this.newVolunteer.img = this.imagePath;
      console.log(this.newVolunteer);
      this.volunteersService.saveToFirebase(this.newVolunteer);
      // this.imagePath = '';
    }else{
      this.volunteersService.saveToFirebase(this.newVolunteer);
    }
    this.addVolunteerForm.reset();
  }


  onuploadProfileImg(event: any){
    this.isUploading = true;
    const fileName = this.addVolunteerForm.value.firstName + this.addVolunteerForm.value.lastName;
    console.log(event, fileName);
    this.volunteersService.uploadFile(event, fileName);
    this.imgUploadPercent = this.volunteersService.uploadPercent;
    this.imagePath = fileName;
    setTimeout(()=>{
      console.log('assigning now');
      this.imgDownloadURL = this.volunteersService.downloadURL;
      this.isUploading = false;
      this.retrieving = true;
    }, 6000)
  }
}
