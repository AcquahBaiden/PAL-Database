import { Injectable, inject } from "@angular/core";
import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "@angular/fire/auth";
import { Firestore, doc, setDoc } from "@angular/fire/firestore";

import { emptyAccess } from "./access.utils";

@Injectable({ providedIn: "root" })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  loginWithPopUp() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  signIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  logout() {
    return signOut(this.auth);
  }

  setUpAccessData(user: UserCredential) {
    return setDoc(doc(this.firestore, "access", user.user.uid), {
      ...emptyAccess,
      email: user.user.email
    });
  }

  async addNewUserCount() {
    return Promise.resolve();
  }
}
