import { Injectable, inject, NgZone } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { Database, ref, objectVal } from '@angular/fire/database';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { emptyAccess, normalizeAccessData, UserAccess } from './access.utils';

export interface SessionState {
  status: 'loading' | 'signedOut' | 'signedIn';
  user: User | null;
  permissions: UserAccess | null;
}

const SIGNED_OUT: SessionState = { status: 'signedOut', user: null, permissions: null };
const LOADING: SessionState = { status: 'loading', user: null, permissions: null };

@Injectable({
  providedIn: 'root'
})
export class SessionStore {
  readonly session$: Observable<SessionState>;
  readonly permissions$: Observable<UserAccess | null>;

  private auth = inject(Auth);
  private db = inject(Database);

  constructor() {
    this.session$ = authState(this.auth).pipe(
      switchMap((user) => {
        if (!user) {
          return of(SIGNED_OUT);
        }

        return objectVal<Record<string, unknown>>(ref(this.db, `Access/${user.uid}`)).pipe(
          map((raw): SessionState => ({
            status: 'signedIn',
            user,
            permissions: normalizeAccessData(raw, user.email ?? null),
          })),
          startWith<SessionState>({ status: 'loading', user, permissions: null }),
          catchError(() =>
            of<SessionState>({ status: 'signedIn', user, permissions: emptyAccess })
          )
        );
      }),
      startWith(LOADING),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.permissions$ = this.session$.pipe(
      map((s) => s.permissions)
    );
  }
}
