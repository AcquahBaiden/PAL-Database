import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class VolunteersGuard implements CanActivate{
  userAccess = null;
  constructor(
    private router: Router,
    private authService: AuthService

  ) {}

  canActivate():Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
    return this.authService.getUserAccessFromDatabase().then((data)=>{
      if(data.val().volunteers){
        return true;
      }else{
        return this.router.createUrlTree(['/noAccess']);
      }
    });

  }
}
