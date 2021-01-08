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
  title = 'PAL-DB';
  formIsLogin = true;
  errorMessage= '';
  isLoginError:boolean=false;
  loginIsActive: boolean = true;
  @ViewChild('loginForm') loginForm!: NgForm;
  @ViewChild('signUpForm') signUpForm!: NgForm;
  userId: string = null;

  onLoginWithPopUp() {
    this.authService.loginWithPopUp();
  }
  onLogout() {
    this.authService.logout();
    this.isLoginError = false;
  }

  onSignIn(){
    this.authService.signIn(this.loginForm.value.email, this.loginForm.value.password)
    .catch((error) =>{ console.log('eror code is', error.code);
    this.isLoginError = true;
      switch(error.code){
        case 'auth/user-not-found':
          this.errorMessage = 'Email address not registered to an account. Please sign up';
          break;
        case 'auth/wrong-password':
          this.errorMessage = 'Incorrect password. Please try again!';
      }
    })
  }

  toggleLogInView(view: string){
    if(view === 'login'){
      this.formIsLogin = true;
      return
    }
      this.formIsLogin = false;
  }

  onSignUp(){
    this.authService.signUp(this.signUpForm.value.email, this.signUpForm.value.password)
  }
}
