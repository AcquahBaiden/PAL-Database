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

    if(this.imagePath){
      this.newMember = form.value;
      this.newMember.img = this.imagePath;
      this.managementService.saveToFirebase(this.newMember);
    }else{
      this.managementService.saveToFirebase(form.value);
    }
    this.addMamangementMemberForm.reset();
  }

  onuploadProfileImg(event: any){
    this.isUploading = true;
    const fileName = this.addMamangementMemberForm.value.firstName + this.addMamangementMemberForm.value.lastName;
    this.managementService.uploadFile(event, fileName);
    this.imgUploadPercent = this.managementService.uploadPercent;
    this.imagePath = fileName;
    setTimeout(()=>{
      this.imgDownloadURL = this.managementService.downloadURL;
      this.isUploading = false;
      this.retrieving = true;
    }, 6000)
  }

}
