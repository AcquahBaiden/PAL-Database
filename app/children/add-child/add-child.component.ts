import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

@Component({
  selector: 'app-add-chiild',
  templateUrl: './add-child.component.html',
  styleUrls: ['./add-child.component.css']
})
export class AddChildComponent implements OnInit {

  @ViewChild('f') addChildForm!: NgForm;
  newForm = new FormControl;
  submitted:boolean = false;
  newChild: Child={firstName:'', lastName:''};
  imgUploadPercent: Observable<number>;
  imgDownloadURL:Observable<string>;
  isUploading = false;
  imagePath: string ='';
  retrieving: boolean = false;

  constructor(private childrenService: ChildrenService) { }

  ngOnInit(): void {
  }

  onSaveChild(form: NgForm){
    this.submitted = true;

    this.newChild.firstName = this.addChildForm.value.firstName;
    this.newChild.lastName = this.addChildForm.value.lastName;
    this.newChild.residence = this.addChildForm.value.residence;
    this.newChild.telephone = this.addChildForm.value.telephone;
    this.newChild.class = this.addChildForm.value.class;
    this.newChild.school = this.addChildForm.value.school;
    this.newChild.parentName = this.addChildForm.value.parentName;
    this.newChild.parentTel = this.addChildForm.value.parentTel;

    if(this.imagePath!=''){
      this.newChild.img = this.imagePath;
      console.log(this.newChild);
      this.childrenService.saveToFirebase(this.newChild);
      this.imagePath = '';
    }else{
      this.childrenService.saveToFirebase(this.newChild);
    }
    // this.childrenService.saveToFirebase(this.newChild);

    this.addChildForm.reset();
  }


  saveImgPath(event:any, fileName: string){
    this.imagePath = fileName.concat('.'.concat(event.target.files[0].name.split('.').pop()));
  }


  onuploadProfileImg(event: any){
    this.isUploading = true;
    const fileName = this.addChildForm.value.firstName + this.addChildForm.value.lastName;
    console.log(event, fileName);
    this.childrenService.uploadFile(event, fileName);
    this.imgUploadPercent = this.childrenService.uploadPercent;
    this.saveImgPath(event, fileName);
    setTimeout(()=>{
      console.log('assigning now');
      this.imgDownloadURL = this.childrenService.downloadURL;
      this.isUploading = false;
      this.retrieving = true;
    }, 6000)
  }

}
