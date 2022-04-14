import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { TestBed } from '@angular/core/testing';

import { ManagementService } from './management.service';
import { of } from 'rxjs';

describe('ManagementService', () => {
  let service: ManagementService;

  const sampleData = [
    {id: '1', name: 'Ama Poku'},{id: '2', name: 'Ama Mensah'}];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        ManagementService,
        {provide: AngularFireDatabase, useValue: jasmine.createSpyObj('AngularFireDatabase',{
          Object: jasmine.createSpyObj({
            valueChanges: of(sampleData)
          })
        })},
        {provide: AngularFireStorage, useValue: jasmine.createSpyObj('AngularFireStorage', {
          ref: 'link to object'
        })}
      ]
    });
    service = TestBed.inject(ManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
