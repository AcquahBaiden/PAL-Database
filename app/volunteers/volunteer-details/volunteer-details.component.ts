import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';

import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { VolunteersService } from '../volunteers.service';

@Component({
  selector: 'app-volunteer-details',
  templateUrl: './volunteer-details.component.html',
  styleUrls: ['./volunteer-details.component.css']
})
export class VolunteerDetailsComponent implements OnInit, OnDestroy {
  selectedVolunteer: Volunteer;
  volunteerId:string = '';
  volunteerSubscriptionChanged!: Subscription;
  profileUrl: Observable<string|null>
  detailsSubscription:Subscription;
  dataLoaded=false;

  constructor(private route: ActivatedRoute,
    private volunteersService: VolunteersService, private router: Router
    ) { }

  ngOnInit(): void {
    this.volunteerSubscriptionChanged = this.route.params
      .subscribe(params=>{
        this.volunteerId = params['id'];
        this.volunteersService.getVolunteer(this.volunteerId).subscribe(volunteer=>{
          this.selectedVolunteer = volunteer;
          this.dataLoaded = true;
        });
      })
  }

  onDeleteVolunteer(){
    this.dataLoaded = false;
    this.volunteersService.deleteVolunteer(this.volunteerId);
    setTimeout(()=>{
      this.dataLoaded = true;
      this.router.navigate(['volunteers']);
    },1500)
  }

  ngOnDestroy(){
    this.volunteerSubscriptionChanged.unsubscribe();
    this.dataLoaded =false;
  }
}
