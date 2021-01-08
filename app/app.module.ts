import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { environment } from '../environments/environment';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './header/header.component';
import { SummaryComponent } from './summary/summary.component';
import { ChildrenListComponent } from './children/children-list/children-list.component';
import { ChildrenComponent } from './children/children.component';
import { ChildEditComponent } from './children/child-edit/child-edit.component';
import { ChildDetailsComponent } from './children/child-details/child-details.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { AddChildComponent } from './children/add-child/add-child.component';
import { ChildrenService } from './children/children.service';
import { AdminComponent } from './admin/admin.component';
import { AccessControlComponent } from './admin/access-control/access-control.component';
import { VolunteersComponent } from './volunteers/volunteers.component';
import { AddVolunteerComponent } from './volunteers/add-volunteer/add-volunteer.component';
import { VolunteerEditComponent } from './volunteers/volunteer-edit/volunteer-edit.component';
import { VolunteerListComponent } from './volunteers/volunteer-list/volunteer-list.component';
import { VolunteerDetailsComponent } from './volunteers/volunteer-details/volunteer-details.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { MatGridListModule } from '@angular/material/grid-list';
// import { MatCardModule } from '@angular/material/card';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
import { LayoutModule } from '@angular/cdk/layout';
import { NoAccessComponent } from './no-access/no-access.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SummaryComponent,
    ChildrenListComponent,
    ChildrenComponent,
    ChildEditComponent,
    ChildDetailsComponent,
    SideBarComponent,
    AddChildComponent,
    AdminComponent,
    AccessControlComponent,
    VolunteersComponent,
    AddVolunteerComponent,
    VolunteerEditComponent,
    VolunteerListComponent,
    VolunteerDetailsComponent,
    NoAccessComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    AngularFireStorageModule,
    BrowserAnimationsModule,
    // MatGridListModule,
    // MatCardModule,
    // MatMenuModule,
    // MatIconModule,
    // MatButtonModule,
    LayoutModule
  ],
  providers: [ChildrenService],
  bootstrap: [AppComponent]
})
export class AppModule { }
