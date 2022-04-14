export interface Volunteer{
  firstName: string;
  lastName: string;
  residence?:string;
  address?: {
    Line1: string;
    Line2: string;
    Line3: string;
  };
  telephone?: number;
  img?:string;
  school?:string;
  level?:string;
  program?:string;
  id?:string;
  email?:string;
  volunteeringInProg?:{
    Prog1: string;
    Prog2: string;
    Prog3: string;
  }
}
