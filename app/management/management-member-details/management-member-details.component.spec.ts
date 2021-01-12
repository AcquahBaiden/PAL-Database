import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementMemberDetailsComponent } from './management-member-details.component';

describe('ManagementMemberDetailsComponent', () => {
  let component: ManagementMemberDetailsComponent;
  let fixture: ComponentFixture<ManagementMemberDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagementMemberDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagementMemberDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
