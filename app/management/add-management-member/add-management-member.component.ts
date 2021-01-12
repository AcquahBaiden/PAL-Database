import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { ManagementMember } from 'src/app/interfaces/management-member.interface';
import { ManagementService } from '../management.service';

@Component({
  selector: 'app-add-management-member',
  templateUrl: './add-management-member.component.html',
  styleUrls: ['./add-management-member.component.css']
})
export class AddManagementMemberComponent implements OnInit {

  @ViewChild('M') addMamangementMemberForm: NgForm;
  submitted:boolean = false;
  newMember: ManagementMember = {firstName:'', lastName:'', position:''};
  imgUploadPercent: Observable<number>;
  imgDownloadURL:Observable<string>;
  isUploading = false;
  imagePath: string = null;
  retrieving: boolean = false;

  constructor(private managementService: ManagementService) { }

  ngOnInit(): void {
  }

  onSaveMember(form: NgForm){
    this.submitted = true;

    this.newMember.firstName = this.addMamangementMemberForm.value.firstName;
    this.newMember.lastName = this.addMamangementMemberForm.value.lastName;
    this.newMember.residence = this.addMamangementMemberForm.value.residence;
    this.newMember.telephone = this.addMamangementMemberForm.value.telephone;
    this.newMember.position = this.addMamangementMemberForm.value.position;
    this.newMember.description = this.addMamangementMemberForm.value.description;

    if(this.imagePath){
      this.newMember.img = this.imagePath;
      console.log(this.newMember);
      this.managementService.saveToFirebase(this.newMember);
    }else{
      this.managementService.saveToFirebase(this.newMember);
    }
    this.addMamangementMemberForm.reset();
  }

  onuploadProfileImg(event: any){
    this.isUploading = true;
    const fileName = this.addMamangementMemberForm.value.firstName + this.addMamangementMemberForm.value.lastName;
    console.log(event, fileName);
    this.managementService.uploadFile(event, fileName);
    this.imgUploadPercent = this.managementService.uploadPercent;
    this.imagePath = fileName;
    setTimeout(()=>{
      console.log('assigning now');
      this.imgDownloadURL = this.managementService.downloadURL;
      this.isUploading = false;
      this.retrieving = true;
    }, 6000)
  }

}
