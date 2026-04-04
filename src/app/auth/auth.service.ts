import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFireDatabase } from "@angular/fire/compat/database";
import firebase from 'firebase/compat/app';
import { first, tap } from "rxjs/operators";
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: "root" })
export class AuthService {
  constructor(
    public auth: AngularFireAuth,
    private db: AngularFireDatabase
  ) {}
  AuthUserId: string = null;
  userIsNewSignup: boolean;

  loginWithPopUp() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  signIn(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  logout() {
    this.auth.signOut();
  }

  signUp(email: string, password: string) {
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  setUpAccessData(user:firebase.auth.UserCredential) {
    this.db
        .object("Access/" + user.user.uid)
        .update({
          'basic': false,
          'admin': false,
          'email': user.user.email,
          'volunteers': false,
          'children': false,
          'management':false,
        })
        .then(() => (this.userIsNewSignup = false));
  }

  addNewUserCount(){
    this.db.object('Summary/DatabaseUsers/number').query.ref
    .transaction(number=>{
      if(number===null){
        return number = 1;
      }else{
        return number + 1;
      }
    })
  }

  getUserId() {
    if (this.userIsNewSignup) {
      return null;
    } else {
      return firstValueFrom(this.auth.authState);
    }
  }


   async getUserAccessFromDatabase() {
    if(await this.getUserId()){
      return this.auth.currentUser.then((user) => {
        return this.db.database.ref("Access/" + user.uid).once('value',()=>{})
      });
    }
    return null;
  }

}
