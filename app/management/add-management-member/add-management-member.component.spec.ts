import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddManagementMemberComponent } from './add-management-member.component';

describe('AddManagementMemberComponent', () => {
  let component: AddManagementMemberComponent;
  let fixture: ComponentFixture<AddManagementMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddManagementMemberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddManagementMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
