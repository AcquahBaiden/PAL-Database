import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminServiceService } from './admin-service.service';

import { AdminComponent } from './admin.component';
import { AdminFilterPipe } from './admin.pipe';
import { MockAdminService } from './mock-admin.service';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminComponent, AdminFilterPipe ],
      providers:[
        AdminComponent, {provide: AdminServiceService, useClass: MockAdminService}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create AdminComponent', () => {
    expect(component).toBeTruthy();
  });
});
