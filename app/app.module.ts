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
    AddChildComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    AngularFireStorageModule
  ],
  providers: [ChildrenService],
  bootstrap: [AppComponent]
})
export class AppModule { }
