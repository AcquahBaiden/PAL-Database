import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFireDatabase } from "@angular/fire/database";
import  firebase  from 'firebase/app'

@Injectable({providedIn: 'root'})

export class AuthService {
  constructor(public auth: AngularFireAuth, private db: AngularFireDatabase){};
  AuthUserId:string= null;

  loginWithPopUp() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  signIn(email: string, password: string){
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  logout(){
    this.auth.signOut();
  }

  signUp(email: string, password: string){
    this.auth.createUserWithEmailAndPassword(email, password);
  }

getUserId(){
  return this.auth.onAuthStateChanged(user=>{
    if(user){
      this.AuthUserId = user.uid;
      return user.uid;
    }
      return null;
  })
}

getUserAccessFromDatabase(uid:string){
  const ref = 'Access/'+uid;
  return this.db.list(ref).valueChanges();
}



}
