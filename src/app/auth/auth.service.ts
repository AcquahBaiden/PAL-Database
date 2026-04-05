import { Injectable, inject } from "@angular/core";
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, GoogleAuthProvider, UserCredential } from "@angular/fire/auth";
import { Database, ref, update, runTransaction } from "@angular/fire/database";

@Injectable({ providedIn: "root" })
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Database);

  loginWithPopUp() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  setUpAccessData(user: UserCredential) {
    return update(ref(this.db, "Access/" + user.user.uid), {
      basic: false,
      admin: false,
      email: user.user.email,
      volunteers: false,
      children: false,
      management: false,
    });
  }

  addNewUserCount() {
    const countRef = ref(this.db, 'Summary/DatabaseUsers/number');
    runTransaction(countRef, (number) => (number === null ? 1 : number + 1));
  }
}
