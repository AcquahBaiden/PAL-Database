import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
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
  constructor(private childrenService: ChildrenService) { }

  ngOnInit(): void {
  }

  onSaveChild(form: NgForm){
    console.log(this.addChildForm);
    this.submitted = true;
    console.log(this.addChildForm.value.firstName);
    this.newChild.firstName = this.addChildForm.value.firstName;
    this.newChild.lastName = this.addChildForm.value.lastName;
    this.newChild.residence = this.addChildForm.value.residence;
    this.newChild.telephone = this.addChildForm.value.telephone;
    this.newChild.class = this.addChildForm.value.class;
    this.newChild.school = this.addChildForm.value.school;
    this.newChild.parentName = this.addChildForm.value.parentName;
    this.newChild.parentTel = this.addChildForm.value.parentTel;
    console.log(this.newChild);
    this.childrenService.saveToFirebase(this.newChild);
    this.addChildForm.reset();
  }
}
