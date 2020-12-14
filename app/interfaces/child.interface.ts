export interface Child{
  firstName: string;
  lastName: string;
  residence?:string;
  address?: [{
    Line1: string;
    Line2: string;
    Line3: string;
  }]
  telephone?: number;
  img?:string;
  class?:string;
  school?:string;
  parentName?:string;
  parentTel?:string;
  id?:string;
}
