import { Injectable } from "@angular/core";
import { CanActivate, Router, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class BasicGuard implements CanActivate{
  userAccess = null;
  constructor(
    private router: Router,
    private authService: AuthService

  ) {}

  canActivate():Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
    return this.authService.getUserAccessFromDatabase().then((data)=>{
      if(!data){
        console.log('Not data');
        return false
      }
      if(data.val().basic){
        return true;
      }else{
        return this.router.createUrlTree(['/noAccess']);
      }
    })

  }


}
