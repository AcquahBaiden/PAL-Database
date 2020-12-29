import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { VolunteersService } from '../volunteers.service';

@Component({
  selector: 'app-volunteer-details',
  templateUrl: './volunteer-details.component.html',
  styleUrls: ['./volunteer-details.component.css']
})
export class VolunteerDetailsComponent implements OnInit, OnDestroy {
  selectedVolunteer: Observable<Volunteer[] | Iterable<Volunteer> | (Iterable<Volunteer> & Volunteer[]) | (Volunteer[] & Iterable<Volunteer>)>;
  volunteerId:string = '';
  volunteerSubscriptionChanged!: Subscription;
  profileUrl: Observable<string|null>

  constructor(private route: ActivatedRoute,
    private volunteersService: VolunteersService,
    ) { }

  ngOnInit(): void {
    this.volunteerSubscriptionChanged = this.route.params
      .subscribe(params=>{
        this.volunteerId = params['id'];
        this.selectedVolunteer = this.volunteersService.getVolunteer(this.volunteerId);
      })
  }

  onDeleteVolunteer(){
    this.volunteersService.deleteVolunteer(this.volunteerId);
  }

  ngOnDestroy(){
    this.volunteerSubscriptionChanged.unsubscribe();
  }
}
