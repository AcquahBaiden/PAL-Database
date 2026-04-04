import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { ChildDetailsComponent } from "./child-details/child-details.component";
import { ChildEditComponent } from "./child-edit/child-edit.component";
import { ChildrenListComponent } from "./children-list/children-list.component";
import { ChildrenComponent } from "./children.component";
import { AddChildComponent } from "./add-child/add-child.component";
import { FilterPipe } from "./filter.pipe";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  imports: [
    RouterModule, 
    CommonModule, 
    FormsModule, 
    AngularFireStorageModule, 
    ReactiveFormsModule, 
    SharedModule,
    ChildrenListComponent,
    ChildrenComponent,
    ChildEditComponent,
    ChildDetailsComponent,
    AddChildComponent,
    FilterPipe
  ]
})
export class ChildrenModule{}
