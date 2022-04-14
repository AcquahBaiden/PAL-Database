import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/database';
import { AdminServiceService } from './admin-service.service';

describe('AdminServiceService', () => {
  let service: AdminServiceService;
  const sampleData = [
    {id: '1', name: 'Ama Poku'},{id: '2', name: 'Ama Mensah'}];
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        AdminServiceService,
        {provide: AngularFireDatabase, useValue: jasmine.createSpyObj('AngularFireDatabase',{
          Object: jasmine.createSpyObj({
            valueChanges: of(sampleData)
          })
        })}
      ]
    });
    service = TestBed.inject(AdminServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
