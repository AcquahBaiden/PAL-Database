import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AddManagementMemberComponent } from "./add-management-member/add-management-member.component";
import { ManagementListComponent } from "./management-list/management-list.component";
import { ManagementMemberDetailsComponent } from "./management-member-details/management-member-details.component";
import { ManagementMemberEditComponent } from "./management-member-edit/management-member-edit.component";
import { ManagementComponent } from "./management.component";
import { ManagersFilterPipe } from "./management.pipe";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  imports: [
    RouterModule, 
    CommonModule, 
    FormsModule, 
    AngularFireStorageModule, 
    ReactiveFormsModule, 
    SharedModule,
    ManagementComponent,
    AddManagementMemberComponent,
    ManagementMemberDetailsComponent,
    ManagementMemberEditComponent,
    ManagementListComponent,
    ManagersFilterPipe
  ]
})
export class ManagementModule{}
