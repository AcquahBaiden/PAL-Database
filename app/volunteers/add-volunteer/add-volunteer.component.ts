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

  onSaveVolunteer(form: NgForm){
    this.submitted = true;

    if(this.imagePath){
      this.newVolunteer = form.value;
      this.newVolunteer.img = this.imagePath;
      this.volunteersService.saveToDB(this.newVolunteer);
    }else{
      this.volunteersService.saveToDB(form.value);
    }
    this.addVolunteerForm.reset();

  }


  onuploadProfileImg(event: any){
    this.isUploading = true;
    const fileName = this.addVolunteerForm.value.firstName + this.addVolunteerForm.value.lastName;
    this.volunteersService.uploadFile(event, fileName);
    this.imgUploadPercent = this.volunteersService.uploadPercent;
    this.imagePath = fileName;
    setTimeout(()=>{
      this.imgDownloadURL = this.volunteersService.downloadURL;
      this.isUploading = false;
      this.retrieving = true;
    }, 6000)
  }
}
