import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { Volunteer } from "../interfaces/volunteer.interface";

@Injectable({
  providedIn: 'root'
})

export class MockVolunteersService{
  constructor(){}

  getVolunteer(id: string):Observable<Volunteer> {
    // const ref = "Volunteers/".concat(id);
    // return this.db
    //   .object(ref)
    //   .valueChanges()
    //   .pipe(
    //     map((responseData: Volunteer) => {
    //       return responseData;
    //     })
    //   );
    const volunteer:Volunteer = {
      email: "mmeeatsu001@st.ug.edu.gh",
      firstName: "Manuela",
      img: "ManuelaAtsu60",
      lastName: "Atsu",
      level: "400",
      program: "Bachelor of Arts in Education",
      residence: "Sakumono Estate, MPS Flats",
      school: "University of Ghana",
      telephone: 0o502441651
    };

    return of(volunteer)

  }

  getVolunteersData():Observable<Volunteer[]>{
    const volunteers:Volunteer[] = [{
      email: "mmeeatsu001@st.ug.edu.gh",
      firstName: "Manuela",
      img: "ManuelaAtsu60",
      lastName: "Atsu",
      level: "400",
      program: "Bachelor of Arts in Education",
      residence: "Sakumono Estate, MPS Flats",
      school: "University of Ghana",
      telephone: 0o502441651
    }];

    return of(volunteers)
  }
}
