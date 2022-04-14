import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(public authService: AuthService){}
  formIsLogin = true;
  errorMessage= '';
  isLoginError:boolean=false;
  @ViewChild('loginForm') loginForm!: NgForm;
  @ViewChild('signUpForm') signUpForm!: NgForm;
  userId: string = null;
  dataLoaded = true;

  onLoginWithPopUp() {
    this.authService.loginWithPopUp();
  }
  onLogout() {
    this.authService.logout();
  }

  onSignIn(){
    this.dataLoaded = false;
    this.authService
      .signIn(this.loginForm.value.email, this.loginForm.value.password)
      .then((user) => {
        this.authService.AuthUserId = user.user.uid;
        this.dataLoaded = true;
      })
      .catch((error) => {
        this.dataLoaded = true;
        this.isLoginError = true;
        switch (error.code) {
          case "auth/user-not-found":
            this.errorMessage =
              "Email address not registered to an account. Please sign up";
            break;
          case "auth/wrong-password":
            this.errorMessage = "Incorrect password. Please try again!";
            break;
          case "auth/network-request-failed":
            this.errorMessage =
              "A network error occured. Please check your internet and try again";
            break;
          default:
            this.errorMessage =
              "Something went wrong. Please try again later";
        }
      });
  }

  toggleLogInView(view: string){
    if(view === 'login'){
      this.formIsLogin = true;
      return
    }
      this.formIsLogin = false;
  }

  onSignUp(){
    this.authService.userIsNewSignup = true;
    this.authService.signUp(this.signUpForm.value.signupEmail, this.signUpForm.value.signupPassword).then((user)=>{
      this.authService.setUpAccessData(user);
      this.authService.addNewUserCount();
    }).catch((error)=>{
      this.isLoginError = true;
      switch(error.code){
        case 'auth/network-request-failed':
          this.errorMessage = 'A network error occured. Please check your internet and try again';
          break;
        case 'auth/email-already-in-use':
          this.errorMessage = 'The email is already in use by another account';
          break;
        default:
          this.errorMessage = 'Something went wrong. Please try again later';
      }
    });
  }
}
