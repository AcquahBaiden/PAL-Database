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
import { SideBarComponent } from './side-bar/side-bar.component';
import { AdminComponent } from './admin/admin.component';
import { AccessControlComponent } from './admin/access-control/access-control.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoAccessComponent } from './no-access/no-access.component';
import { ChildrenModule } from './children/children.module';
import { VolunteersModule } from './volunteers/volunteers.module';
import { ManagementModule } from './management/management.module';
import { AdminFilterPipe } from './admin/admin.pipe';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SummaryComponent,
    SideBarComponent,
    AdminComponent,
    AccessControlComponent,
    NoAccessComponent,
    AdminFilterPipe
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
    ChildrenModule,
    VolunteersModule,
    ManagementModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
