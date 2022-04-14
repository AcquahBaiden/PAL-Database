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
  newChild: Child={firstName:'', lastName:''};
  imgUploadPercent: Observable<number>;
  imgDownloadURL:Observable<string>;
  isUploading = false;
  imagePath: string ='';
  retrieving: boolean = false;
  interests:string[]=[];
  programs:{program:string, year: string}[]=[];

  constructor(private childrenService: ChildrenService) { }

  ngOnInit(): void {
  }

  onSaveChild(form: NgForm){

    this.newChild.firstName = this.addChildForm.value.firstName;
    this.newChild.lastName = this.addChildForm.value.lastName;
    this.newChild.residence = this.addChildForm.value.residence;
    this.newChild.telephone = this.addChildForm.value.telephone;
    this.newChild.class = this.addChildForm.value.class;
    this.newChild.school = this.addChildForm.value.school;
    this.newChild.parentName = this.addChildForm.value.parentName;
    this.newChild.parentTel = this.addChildForm.value.parentTel;
    this.newChild.description = this.addChildForm.value.description;
    this.newChild.interests = this.interests;
    this.newChild.programs = this.programs;

    if(this.imagePath!=''){
      this.newChild.img = this.imagePath;
      this.childrenService.saveToDB(this.newChild);
      this.imagePath = '';
    }else{
      this.childrenService.saveToDB(this.newChild);
    }

    this.addChildForm.reset();
  }

  onAddInterest(form:any){
    this.interests.push(form.value);
  }

  onAddProgram(programName:any, programYear:any){
    this.programs.push({'program':programName.value,'year':programYear.value});
  }


  onuploadProfileImg(event: any){
    this.isUploading = true;
    const fileName = this.addChildForm.value.firstName + this.addChildForm.value.lastName;
    this.childrenService.uploadFile(event, fileName);
    this.imgUploadPercent = this.childrenService.uploadPercent;
    this.imagePath = fileName
    setTimeout(()=>{
      this.imgDownloadURL = this.childrenService.downloadURL;
      this.isUploading = false;
      this.retrieving = true;
    }, 6000)
  }

}
