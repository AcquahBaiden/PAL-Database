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
  private emulatorSignInTimeoutMs = 1500;

  loginWithPopUp() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  async signIn(email: string, password: string) {
    const signInPromise = signInWithEmailAndPassword(this.auth, email, password);

    if (!environment.useEmulators) {
      return signInPromise;
    }

    const outcome = await Promise.race<
      | { kind: "sdk"; value: UserCredential }
      | { kind: "error"; error: unknown }
      | { kind: "timeout" }
    >([
      signInPromise.then(
        (value) => ({ kind: "sdk" as const, value }),
        (error) => ({ kind: "error" as const, error })
      ),
      new Promise<{ kind: "timeout" }>((resolve) => {
        window.setTimeout(() => resolve({ kind: "timeout" }), this.emulatorSignInTimeoutMs);
      })
    ]);

    if (outcome.kind === "sdk") {
      return outcome.value;
    }

    if (outcome.kind === "error") {
      throw outcome.error;
    }

    if (outcome.kind === "timeout") {
      await this.verifyEmulatorSignInAttempt(email, password);

      const finalOutcome = await Promise.race<
        | { kind: "sdk"; value: UserCredential }
        | { kind: "error"; error: unknown }
        | { kind: "timeout" }
      >([
        signInPromise.then(
          (value) => ({ kind: "sdk" as const, value }),
          (error) => ({ kind: "error" as const, error })
        ),
        new Promise<{ kind: "timeout" }>((resolve) => {
          window.setTimeout(() => resolve({ kind: "timeout" }), this.emulatorSignInTimeoutMs);
        })
      ]);

      if (finalOutcome.kind === "sdk") {
        return finalOutcome.value;
      }

      if (finalOutcome.kind === "error") {
        throw finalOutcome.error;
      }

      throw { code: "auth/network-request-failed" };
    }

    throw { code: "auth/network-request-failed" };
  }

  signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async resetPassword(email: string) {
    const baseUrl = this.getIdentityToolkitBaseUrl();
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

  private getIdentityToolkitBaseUrl() {
    return environment.useEmulators
      ? `http://${environment.emulators.auth.host}:${environment.emulators.auth.port}`
      : "https://identitytoolkit.googleapis.com";
  }

  private async verifyEmulatorSignInAttempt(email: string, password: string) {
    const response = await fetch(
      `${this.getIdentityToolkitBaseUrl()}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    ).catch(() => {
      throw { code: "auth/network-request-failed" };
    });

    if (response.ok) {
      return;
    }

    const errorData = await response.json().catch(() => null);
    const errorCode = errorData?.error?.message;

    switch (errorCode) {
      case "EMAIL_NOT_FOUND":
      case "INVALID_PASSWORD":
      case "INVALID_LOGIN_CREDENTIALS":
        throw { code: "auth/invalid-credential" };
      case "USER_DISABLED":
        throw { code: "auth/user-disabled" };
      case "INVALID_EMAIL":
        throw { code: "auth/invalid-email" };
      default:
        throw { code: "auth/network-request-failed" };
    }
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
