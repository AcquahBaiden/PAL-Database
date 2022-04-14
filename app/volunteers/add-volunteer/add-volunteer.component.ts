import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
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
  newForm: FormGroup;
  submitted:boolean = false;
  newVolunteer: Volunteer={firstName:'', lastName:''};
  imgUploadPercent: Observable<number>;
  imgDownloadURL:Observable<string>;
  isUploading = false;
  imagePath: string = null;
  retrieving: boolean = false;
  constructor(private volunteersService: VolunteersService, private fb: FormBuilder) { }

  ngOnInit(): void {
    // this.newForm = this.fb.group({
    //   title:['new volunteer'],
    //   firstName: ['',Validators.required],
    //   lastName: ['',Validators.required],
    //   residence: [''],
    //   address: this.fb.array([{
    //     Line1: [''],
    //     Line2: [''],
    //     Line3: [''],
    //   }]),
    //   telephone: [''],
    //   img: [''],
    //   school: [''],
    //   level: [''],
    //   program: [''],
    //   id: [''],
    //   email: [''],
    //   registeredProgram:[{
    //     Prog1: [''],
    //     Prog2: [''],
    //     Prog3: [''],
    //   }]
    //     })
  }

  onSaveVolunteer(form: NgForm){
    this.submitted = true;
    const address = {
      Line1:form.value.Line1,
      Line2:form.value.Line2,
      Line3:form.value.Line3
    };
    const volunteeringInProg = {
      Prog1: form.value.Prog1,
      Prog2: form.value.Prog2,
      Prog3: form.value.Prog3
    };
    delete form.value.Line1;
    delete form.value.Line2;
    delete form.value.Line3;
    delete form.value.Prog1;
    delete form.value.Prog2;
    delete form.value.Prog3;
    this.newVolunteer = form.value;
    this.newVolunteer.address = address;
    this.newVolunteer.volunteeringInProg = volunteeringInProg;
    console.log(this.newVolunteer);
    if(this.imagePath){
      this.newVolunteer.img = this.imagePath;
      this.volunteersService.saveToDB(this.newVolunteer);
    }else{
      this.volunteersService.saveToDB(this.newVolunteer);
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
