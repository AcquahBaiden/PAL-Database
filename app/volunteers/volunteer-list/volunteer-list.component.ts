import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { VolunteersService } from '../volunteers.service';

@Component({
  selector: 'app-volunteer-list',
  templateUrl: './volunteer-list.component.html',
  styleUrls: ['./volunteer-list.component.css']
})
export class VolunteerListComponent implements OnInit {
  isFetching:boolean = true;
  Volunteers:Observable<Volunteer[]>;
  searchText = '';

  constructor(private volunteersService: VolunteersService) {}


  ngOnInit(): void {
    this.isFetching = true;
    this.Volunteers =  this.volunteersService.getVolunteersData()
      this.isFetching = false;
  }

}
