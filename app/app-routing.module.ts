import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccessControlComponent } from './admin/access-control/access-control.component';

import { AdminComponent } from './admin/admin.component';
import { ChildrenGuard } from './auth/children.guard';
import { AddChildComponent } from './children/add-child/add-child.component';
import { ChildDetailsComponent } from './children/child-details/child-details.component';
import { ChildEditComponent } from './children/child-edit/child-edit.component';
import { ChildrenComponent } from './children/children.component';
import { NoAccessComponent } from './no-access/no-access.component';
import { SummaryComponent } from './summary/summary.component';
import { AddVolunteerComponent } from './volunteers/add-volunteer/add-volunteer.component';
import { VolunteerDetailsComponent } from './volunteers/volunteer-details/volunteer-details.component';
import { VolunteerEditComponent } from './volunteers/volunteer-edit/volunteer-edit.component';
import { VolunteersComponent } from './volunteers/volunteers.component';

const routes: Routes = [
  {path: '', redirectTo: '/summary', pathMatch: 'full'},
  {path: 'summary', component: SummaryComponent},
  {path: 'add-child', component: AddChildComponent},
  {path: 'noAccess', component: NoAccessComponent},
  {path: 'admin', component: AdminComponent, children:[
    {path: '', component: AccessControlComponent}
  ]},
  {path: 'children', component: ChildrenComponent, children:[
    {path:':id', component: ChildDetailsComponent},
    {path:':id/edit',component: ChildEditComponent},
  ]},
  {path: 'volunteers', component: VolunteersComponent, children:[
    {path: ':id', component: VolunteerDetailsComponent},
    {path: ':id/edit', component: VolunteerEditComponent}
  ]},
  {path: 'add-volunteer', component: AddVolunteerComponent}



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
