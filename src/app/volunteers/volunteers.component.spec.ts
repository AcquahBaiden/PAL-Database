import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolunteersComponent } from './volunteers.component';
import { VolunteersFilterPipe } from './volunteers.pipe';

describe('VolunteersComponent', () => {
  let component: VolunteersComponent;
  let fixture: ComponentFixture<VolunteersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VolunteersComponent, VolunteersFilterPipe ],

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolunteersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
