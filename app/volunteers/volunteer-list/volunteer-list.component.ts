import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { Volunteer } from 'src/app/interfaces/volunteer.interface';
import { VolunteersService } from '../volunteers.service';

@Component({
  selector: 'app-volunteer-list',
  templateUrl: './volunteer-list.component.html',
  styleUrls: ['./volunteer-list.component.css']
})
export class VolunteerListComponent implements OnInit {
  isFetching:boolean = true;
  // @Output() idSelected : EventEmitter<any> = new EventEmitter();
  Volunteers:any;

  constructor(private volunteersService: VolunteersService) {}


  ngOnInit(): void {
    this.isFetching = true;
    this.Volunteers =  this.volunteersService.getVolunteersData()
                .pipe(
                  map((responseData:any)=>{
                    const VolunteerData:Volunteer[] = [];
                      for(const key in responseData){
                        if(responseData.hasOwnProperty(key)){
                          VolunteerData.push({...responseData[key], id: key})
                        }
                      }
                      return VolunteerData;
                  }

                  )
                );
      this.isFetching = false;
      // this.profileUrl = this.volunteersService.getProfileUrl('EmmanuelBaiden');
  }

  onIdSelection(){
    // console.log('About to emit');
    // this.idSelected.emit(null);
  }

}
