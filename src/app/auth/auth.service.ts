import { Injectable, inject } from "@angular/core";
import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "@angular/fire/auth";
import { Firestore, doc, setDoc } from "@angular/fire/firestore";

import { emptyAccess } from "./access.utils";
import { environment } from "../../environments/environment";

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

  async resetPassword(email: string) {
    const baseUrl = environment.useEmulators
      ? `http://${environment.emulators.auth.host}:${environment.emulators.auth.port}`
      : "https://identitytoolkit.googleapis.com";
    const response = await fetch(
      `${baseUrl}/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${environment.firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requestType: "PASSWORD_RESET",
          email
        })
      }
    );

    if (response.ok) {
      return;
    }

    const errorData = await response.json().catch(() => null);
    const errorCode = errorData?.error?.message;

    if (errorCode === "EMAIL_NOT_FOUND" || errorCode === "USER_NOT_FOUND") {
      return;
    }

    if (errorCode === "INVALID_EMAIL") {
      throw { code: "auth/invalid-email" };
    }

    throw new Error(errorCode || "PASSWORD_RESET_FAILED");
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
