import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs/internal/Observable";
import { map, take } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: "root" })
export class ChildrenGuard{
  userAccess = null;
  constructor(
    private router: Router,
    private authService: AuthService,
    private db: AngularFireDatabase,

  ) {}


}
