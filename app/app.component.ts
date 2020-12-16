import { Component, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormControl, NgForm } from '@angular/forms';
import  firebase  from 'firebase/app'



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor( public auth: AngularFireAuth){}
  title = 'PAL-DB';
  formIsLogin = true;
  errorMessage= '';
  isLoginError:boolean=false;
  loginIsActive: boolean = true;
  @ViewChild('loginForm') loginForm!: NgForm;
  @ViewChild('signUpForm') signUpForm!: NgForm;
  newForm= new FormControl;

  login() {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  logout() {
    this.auth.signOut();
  }
  signIn(form: NgForm){
    this.auth.signInWithEmailAndPassword(this.loginForm.value.email, this.loginForm.value.password)
    .catch((error) =>{ console.log('eror code is', error.code);
    this.isLoginError = true;
      switch(error.code){
        case 'auth/user-not-found':
          this.errorMessage = 'Email address not registered to an account. Please sign up';
          break;
        case 'auth/wrong-password':
          this.errorMessage = 'Incorrect password. Please try again!';
      }
    });
  }

  toggleLogInView(view: string){
    if(view == 'login'){
      this.formIsLogin = true;
      this.loginIsActive = true
    }else{
      this.formIsLogin = false;
      this.loginIsActive = false;
    }
  }

  signUp(form: NgForm){
    this.auth.createUserWithEmailAndPassword(this.signUpForm.value.signupEmail, this.signUpForm.value.signupPassword)
  }
}
