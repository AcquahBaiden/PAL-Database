import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementMemberEditComponent } from './management-member-edit.component';

describe('ManagementMemberEditComponent', () => {
  let component: ManagementMemberEditComponent;
  let fixture: ComponentFixture<ManagementMemberEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementMemberEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementMemberEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
