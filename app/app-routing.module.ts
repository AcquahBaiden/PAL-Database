import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddChildComponent } from './children/add-child/add-child.component';
import { ChildDetailsComponent } from './children/child-details/child-details.component';
import { ChildEditComponent } from './children/child-edit/child-edit.component';
import { ChildrenComponent } from './children/children.component';
import { SummaryComponent } from './summary/summary.component';
import { ChildrenListComponent } from './children/children-list/children-list.component';

const routes: Routes = [
  {path: '', redirectTo: '/summary', pathMatch: 'full'},
  {path: 'summary', component: SummaryComponent},
  {path: 'add-child', component: AddChildComponent},
  {path: 'children', component: ChildrenComponent, children:[
    {path:'', component: ChildrenComponent},
    {path:':id', component: ChildDetailsComponent},
    {path:':id/edit',component: ChildEditComponent},
  ]},



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
