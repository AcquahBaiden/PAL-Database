// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { GetDownloadURLPipe } from '@angular/fire/storage';
// import { FormsModule, NgForm } from '@angular/forms';
// import { ActivatedRoute } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { of } from 'rxjs/internal/observable/of';
// import { MockVolunteersService } from '../mock-volunteers.service';
// import { VolunteersService } from '../volunteers.service';
// import { convertToParamMap } from '@angular/router';
// import { VolunteerDetailsComponent } from './volunteer-details.component';
// import { Observable } from 'rxjs';


// describe('VolunteerDetailsComponent', () => {
//   let component: VolunteerDetailsComponent;
//   let fixture: ComponentFixture<VolunteerDetailsComponent>;
//   let userId: '-Mvndyc2CXhIct7mD0Bs';
//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       declarations: [ VolunteerDetailsComponent, GetDownloadURLPipe ],
//       imports:[FormsModule, RouterTestingModule.withRoutes([])],
//       providers:[
//         VolunteerDetailsComponent, NgForm,
//         { provide: VolunteersService, useClass: MockVolunteersService},
//         { provide: ActivatedRoute, useValue: {
//             params: of({'id':'-Mvndyc2CXhIct7mD0Bs'})
//         }}
//       ]
//     })
//     .compileComponents();
//   });

//   beforeEach(() => {
//     fixture = TestBed.createComponent(VolunteerDetailsComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   // For the router spy on. Details here https://stackoverflow.com/questions/39791773/how-can-i-unit-test-a-component-that-uses-the-router-in-angular
// });
// //Mocking the download url https://stackoverflow.com/questions/49709707/angular-5-angular-firebase-testing-mocking-getdownloadurl-method
