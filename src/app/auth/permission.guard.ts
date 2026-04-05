import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

import { PermissionKey } from './access.utils';
import { SessionStore } from './session.store';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private router: Router,
    private sessionStore: SessionStore
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const required = route.data['permission'] as PermissionKey | undefined;

    return this.sessionStore.session$.pipe(
      filter((s) => s.status !== 'loading'),
      take(1),
      map((s) => {
        if (s.status === 'signedOut') {
          return false;
        }

        if (!required) {
          return true;
        }

        return s.permissions?.[required]
          ? true
          : this.router.createUrlTree(['/noAccess']);
      })
    );
  }
}
