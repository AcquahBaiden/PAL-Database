import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AngularFireStorageModule } from '@angular/fire/storage';
import { ChildDetailsComponent } from "./child-details/child-details.component";
import { ChildEditComponent } from "./child-edit/child-edit.component";
import { ChildrenListComponent } from "./children-list/children-list.component";
import { ChildrenComponent } from "./children.component";
import { AddChildComponent } from "./add-child/add-child.component";
import { FilterPipe } from "./filter.pipe";

@NgModule({
  declarations:[
    ChildrenListComponent,
    ChildrenComponent,
    ChildEditComponent,
    ChildDetailsComponent,
    AddChildComponent,
    FilterPipe
  ],
  imports:[RouterModule, CommonModule, FormsModule,AngularFireStorageModule, ReactiveFormsModule]
})
export class ChildrenModule{}
