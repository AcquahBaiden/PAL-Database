import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AddVolunteerComponent } from "./add-volunteer/add-volunteer.component";
import { VolunteerDetailsComponent } from "./volunteer-details/volunteer-details.component";
import { VolunteerEditComponent } from "./volunteer-edit/volunteer-edit.component";
import { VolunteerListComponent } from "./volunteer-list/volunteer-list.component";
import { VolunteersComponent } from "./volunteers.component";
import { VolunteersFilterPipe } from "./volunteers.pipe";

@NgModule({
  declarations:[
    VolunteersComponent,
    AddVolunteerComponent,
    VolunteerEditComponent,
    VolunteerListComponent,
    VolunteerDetailsComponent,
    VolunteersFilterPipe
  ],
  imports:[RouterModule, CommonModule, FormsModule,AngularFireStorageModule, ReactiveFormsModule]
})
export class VolunteersModule{}
