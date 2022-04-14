import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { VolunteersService } from '../volunteers.service';

@Component({
  selector: 'app-volunteer-edit',
  templateUrl: './volunteer-edit.component.html',
  styleUrls: ['./volunteer-edit.component.css']
})
export class VolunteerEditComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private volunteersService: VolunteersService) { }
  @ViewChild('editForm', {static: false}) Form: NgForm;
  volIdToEdit:string;
  selectedVol:Volunteer;
  imageLoaded:boolean = false;
  profileImg:string = null;
  editSubscription: Subscription;
  dataLoaded=false;


  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.dataLoaded = false;
      this.volIdToEdit = params["id"];
      this.editSubscription = this.volunteersService
        .getVolunteer(this.volIdToEdit)
        .subscribe((volunteer) => {
          this.selectedVol = volunteer;
          this.Form.setValue({
            firstName: volunteer.firstName,
            lastName: volunteer.lastName,
            email: volunteer.email,
            telephone: volunteer.telephone,
            residence: volunteer.residence,
            level: volunteer.level,
            school: volunteer.school,
            program: volunteer.program
          });
          this.dataLoaded = true;
          this.profileImg = this.selectedVol.img;
         this.profileImg === ""
           ? (this.imageLoaded = false)
           : (this.imageLoaded = true);
        });
    });
  }

  onUpdateVolunteer(form: NgForm){
    this.volunteersService.updateVolunteer(this.volIdToEdit,form.value);
  }

  onuploadProfileImg(event:any){
    const fileName = (this.selectedVol.firstName + this.selectedVol.lastName).concat((Math.floor(Math.random() * 100)).toString());
    this.volunteersService.uploadFile(event, fileName);
    setTimeout(()=>{
      this.volunteersService.updateVolunteerProfilePhoto(this.volIdToEdit, fileName).then(()=>{
        this.profileImg = fileName
      });
    },2000);
  }

  ngOnDestroy(){
    this.editSubscription.unsubscribe();
    this.profileImg = null;
    this.dataLoaded = false
  }
}
