import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from './auth/auth.service';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { NotificationComponent } from './notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, SideBarComponent, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(public authService: AuthService, private cdr: ChangeDetectorRef){}
  formIsLogin = true;
  errorMessage= '';
  isLoginError:boolean = false;
  isSubmitting:boolean = false;
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
    this.isSubmitting = true;
    this.isLoginError = false;
    this.cdr.detectChanges(); // Force update UI to show spinner
    
    this.authService
      .signIn(this.loginForm.value.email, this.loginForm.value.password)
      .then((user) => {
        this.authService.AuthUserId = user.user.uid;
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
      .catch((error) => {
        this.isSubmitting = false;
        this.isLoginError = true;
        console.error('Login error:', error);
        
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            this.errorMessage = "Invalid email or password. Please try again.";
            break;
          case "auth/network-request-failed":
            this.errorMessage = "A network error occurred. Please check your internet and try again.";
            break;
          case "auth/too-many-requests":
            this.errorMessage = "Too many failed attempts. Please try again later.";
            break;
          default:
            this.errorMessage = error.message || "An unexpected error occurred. Please try again later.";
        }
        
        this.cdr.detectChanges(); // Force update UI to hide spinner and show error
      });
  }

  toggleLogInView(view: string){
    this.isLoginError = false;
    if(view === 'login'){
      this.formIsLogin = true;
      return
    }
    this.formIsLogin = false;
  }

  onSignUp(){
    this.isSubmitting = true;
    this.isLoginError = false;
    this.cdr.detectChanges();
    
    this.authService.userIsNewSignup = true;
    this.authService.signUp(this.signUpForm.value.signupEmail, this.signUpForm.value.signupPassword).then((user)=>{
      this.authService.setUpAccessData(user);
      this.authService.addNewUserCount();
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }).catch((error)=>{
      this.isSubmitting = false;
      this.isLoginError = true;
      switch(error.code){
        case 'auth/network-request-failed':
          this.errorMessage = 'A network error occurred. Please check your internet and try again';
          break;
        case 'auth/email-already-in-use':
          this.errorMessage = 'The email is already in use by another account';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          this.errorMessage = error.message || 'Something went wrong. Please try again later';
      }
      this.cdr.detectChanges();
    });
  }
}
