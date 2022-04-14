import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ManagementService } from '../management.service';
import { MockManagementService } from '../mock-management.service';

import { AddManagementMemberComponent } from './add-management-member.component';

describe('AddManagementMemberComponent', () => {
  let component: AddManagementMemberComponent;
  let fixture: ComponentFixture<AddManagementMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddManagementMemberComponent ],
      imports: [FormsModule],
      providers: [
        AddManagementMemberComponent,
        { provide: ManagementService, useClass: MockManagementService}
      ]
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
