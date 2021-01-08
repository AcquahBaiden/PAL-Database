import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate{

  constructor(private router: Router, private authService: AuthService){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean|UrlTree{
    console.log('in');
    console.log(this.authService.auth.user);
    if(!this.authService.auth.user){
      this.router.navigate['auth'],{queryParams: {}}
    } return true;
  }
}
