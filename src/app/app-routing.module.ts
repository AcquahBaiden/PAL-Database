import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminComponent } from './admin/admin.component';
import { ArchivedComponent } from './archived/archived.component';
import { ArchivedDetailsComponent } from './archived/archived-details/archived-details.component';
import { PermissionGuard } from './auth/permission.guard';
import { AddChildComponent } from './children/add-child/add-child.component';
import { ChildDetailsComponent } from './children/child-details/child-details.component';
import { ChildEditComponent } from './children/child-edit/child-edit.component';
import { ChildrenComponent } from './children/children.component';
import { AddManagementMemberComponent } from './management/add-management-member/add-management-member.component';
import { ManagementMemberDetailsComponent } from './management/management-member-details/management-member-details.component';
import { ManagementMemberEditComponent } from './management/management-member-edit/management-member-edit.component';
import { ManagementComponent } from './management/management.component';
import { NoAccessComponent } from './no-access/no-access.component';
import { SummaryComponent } from './summary/summary.component';
import { AddVolunteerComponent } from './volunteers/add-volunteer/add-volunteer.component';
import { VolunteerDetailsComponent } from './volunteers/volunteer-details/volunteer-details.component';
import { VolunteerEditComponent } from './volunteers/volunteer-edit/volunteer-edit.component';
import { VolunteersComponent } from './volunteers/volunteers.component';

const routes: Routes = [
  {path: '', redirectTo: '/summary', pathMatch: 'full'},
  {path: 'summary', component: SummaryComponent, canActivate: [PermissionGuard], data: { permission: 'basic' }},
  {path: 'noAccess', component: NoAccessComponent},
  {path: 'admin', component: AdminComponent, canActivate:[PermissionGuard], data: { permission: 'admin' }},
  {path: 'archived', component: ArchivedComponent, canActivate:[PermissionGuard], data: { permission: 'basic' }, children: [
    {path: ':type/:id', component: ArchivedDetailsComponent}
  ]},
  {path: 'add-child', component: AddChildComponent, canActivate:[PermissionGuard], data: { permission: 'children' }},
  {path: 'children', component: ChildrenComponent, canActivate:[PermissionGuard], data: { permission: 'children' }, children:[
    {path:':id', component: ChildDetailsComponent},
    {path:':id/edit',component: ChildEditComponent},
  ]},
  {path: 'add-volunteer', component: AddVolunteerComponent, canActivate:[PermissionGuard], data: { permission: 'volunteers' }},
  {path: 'volunteers', component: VolunteersComponent, canActivate:[PermissionGuard], data: { permission: 'volunteers' }, children:[
    {path: ':id', component: VolunteerDetailsComponent},
    {path: ':id/edit', component: VolunteerEditComponent}
  ]},
  {path: 'add-management-member', component: AddManagementMemberComponent, canActivate:[PermissionGuard], data: { permission: 'management' }},
  {path: 'management', component: ManagementComponent, canActivate:[PermissionGuard], data: { permission: 'management' }, children: [
    {path: ':id', component: ManagementMemberDetailsComponent},
    {path: ':id/edit', component: ManagementMemberEditComponent}
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
