import { Injectable, inject } from '@angular/core';
import { Auth, User, authState } from '@angular/fire/auth';
import { Firestore, doc } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { emptyAccess, normalizeAccessData, UserAccess } from './access.utils';
import { observeDocumentData } from '../shared/firestore-data.utils';

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
  private firestore = inject(Firestore);

  constructor() {
    this.session$ = authState(this.auth).pipe(
      switchMap((user) => {
        if (!user) {
          return of(SIGNED_OUT);
        }

        return observeDocumentData<Record<string, unknown>>(doc(this.firestore, 'access', user.uid)).pipe(
          map((raw): SessionState => ({
            status: 'signedIn',
            user,
            permissions: normalizeAccessData(raw, user.email ?? null),
          })),
          startWith<SessionState>({ status: 'loading', user, permissions: null }),
          catchError((error) => {
            console.error('[SessionStore] Failed to load access document', {
              uid: user.uid,
              email: user.email ?? null,
              error
            });
            return of<SessionState>({ status: 'signedIn', user, permissions: emptyAccess });
          })
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
