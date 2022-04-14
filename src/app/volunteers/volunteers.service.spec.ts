import { TestBed } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { of } from 'rxjs';
import { VolunteersService } from './volunteers.service';

describe('VolunteersService', () => {
  let service: VolunteersService;

  const sampleData = [
    {id: '1', name: 'Ama Poku'},{id: '2', name: 'Ama Mensah'}];

  const dataSpy = jasmine.createSpyObj({
    valueChanges: of(sampleData)
  })

  const afSpy = jasmine.createSpyObj('AngularFireDatabase',{
    Object: dataSpy
  });

  const storageSpy = jasmine.createSpyObj('AngularFireStorage', {
    ref: 'link to object'
  })
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers:[
        VolunteersService,
        {provide: AngularFireDatabase, useValue: afSpy},
        {provide: AngularFireStorage, useValue: storageSpy}
      ]
    });
    service = TestBed.inject(VolunteersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('should get volunteers data from firebase ', () => {
  //   service.getVolunteersData();
  //   expect(dataSpy.valueChanges).toHaveBeenCalled();
  //   expect(afSpy.Object).toHaveBeenCalledWith('Volunteers')
  // })
});
