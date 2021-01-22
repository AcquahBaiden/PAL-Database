import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

import { Child } from 'src/app/interfaces/child.interface';
import { ChildrenService } from '../children.service';

@Component({
  selector: 'app-child-edit',
  templateUrl: './child-edit.component.html',
  styleUrls: ['./child-edit.component.css']
})
export class ChildEditComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private childrenService: ChildrenService, private router: Router) { }
  @ViewChild('editForm', {static: false}) Form: NgForm;
  childIdToEdit:string = '';
  selectedChildtoEdit: Child;
  editSubscription:Subscription;
  imgDownloadURL:Observable<string>;
  dataLoaded:boolean
  profileImg:string = null;
  imageLoaded:boolean = false;

  ngOnInit(): void {
    this.imageLoaded = false;
     this.editSubscription = this.route.params.subscribe(params=>{
        this.childIdToEdit = params['id'];
        this.childrenService.getChild(this.childIdToEdit).subscribe((child)=>{
          this.selectedChildtoEdit = child;
          this.dataLoaded = true;
          this.Form.setValue({
            firstName: this.selectedChildtoEdit.firstName,
            lastName: this.selectedChildtoEdit.lastName,
            residence: this.selectedChildtoEdit.residence,
            class: this.selectedChildtoEdit.class,
            school: this.selectedChildtoEdit.school,
            parentName: this.selectedChildtoEdit.parentName,
            parentTel: this.selectedChildtoEdit.parentTel,
            description: this.selectedChildtoEdit.description,
            telephone: this.selectedChildtoEdit.telephone

          })
          this.profileImg = this.selectedChildtoEdit.img;
          this.profileImg === ''? this.imageLoaded=false: this.imageLoaded =true;
        });
      })

  }

  onUpdateChild(form: NgForm){
    this.childrenService.updateChild(this.childIdToEdit,form.value);
    this.router.navigate(['../'], {relativeTo:this.route})
  }

  onuploadProfileImg(event: any){
    const fileName = (this.selectedChildtoEdit.firstName + this.selectedChildtoEdit.lastName).concat((Math.floor(Math.random() * 100)).toString());
    this.childrenService.uploadFile(event, fileName);
    setTimeout(()=>{
      this.childrenService.updateChildProfile(this.childIdToEdit, fileName).then(()=>{
        this.profileImg = fileName
      });
    },2000);
  }

  ngOnDestroy(){
    this.editSubscription.unsubscribe();
    this.profileImg = null;
  }

}
