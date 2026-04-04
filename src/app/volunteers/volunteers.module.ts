import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { AngularFireStorageModule } from "@angular/fire/compat/storage";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AddVolunteerComponent } from "./add-volunteer/add-volunteer.component";
import { VolunteerDetailsComponent } from "./volunteer-details/volunteer-details.component";
import { VolunteerEditComponent } from "./volunteer-edit/volunteer-edit.component";
import { VolunteerListComponent } from "./volunteer-list/volunteer-list.component";
import { VolunteersComponent } from "./volunteers.component";
import { VolunteersFilterPipe } from "./volunteers.pipe";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  imports: [
    RouterModule, 
    CommonModule, 
    FormsModule, 
    AngularFireStorageModule, 
    ReactiveFormsModule, 
    SharedModule,
    VolunteersComponent,
    AddVolunteerComponent,
    VolunteerListComponent,
    VolunteerDetailsComponent,
    VolunteerEditComponent, // I should also make this standalone soon
    VolunteersFilterPipe
  ]
})
export class VolunteersModule{}
