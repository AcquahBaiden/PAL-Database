export interface ManagementMember{
  firstName: string;
  lastName: string;
  residence?:string;
  email?:string;
  address?: [{
    Line1: string;
    Line2: string;
    Line3: string;
  }];
  description?: string;
  telephone?: number;
  img?:string;
  id?:string;
  position?: string;
}
