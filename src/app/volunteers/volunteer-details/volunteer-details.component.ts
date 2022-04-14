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
  address:string[]=[];
  volunteerInPorg:string[]=[];

  constructor(private route: ActivatedRoute,
    private volunteersService: VolunteersService, private router: Router
    ) { }

  ngOnInit(): void {
    this.volunteerSubscriptionChanged = this.route.params
      .subscribe(params=>{
        this.volunteerId = params['id'];
        this.volunteersService.getVolunteer(this.volunteerId).subscribe(volunteer=>{
          this.selectedVolunteer = volunteer;
          if(volunteer.address){
            for(const line in volunteer.address){
              this.address.push(volunteer.address[line])
            }
          }
          if(volunteer.volunteeringInProg){
            for(const prog in volunteer.volunteeringInProg){
              this.volunteerInPorg.push(volunteer.volunteeringInProg[prog])
            }
          }
          this.dataLoaded = true;
        });
      })
  }

  onDeleteVolunteer(){
    this.dataLoaded = false;
    this.volunteersService.deleteVolunteer(this.volunteerId);
    this.router.navigate(['volunteers']);
  }

  ngOnDestroy(){
    this.volunteerSubscriptionChanged.unsubscribe();
  }
}
