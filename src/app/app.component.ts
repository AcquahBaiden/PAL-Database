import { Component, NgZone } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from './auth/auth.service';

import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SessionStore } from './auth/session.store';
import { HeaderComponent } from './header/header.component';
import { NotificationService } from './notification/notification.service';
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
  formIsLogin = true;
  errorMessage = '';
  isLoginError = false;
  isSubmitting = false;
  isSidebarCollapsed = false;

  constructor(
    public authService: AuthService,
    public sessionStore: SessionStore,
    private notiService: NotificationService,
    private router: Router,
    private zone: NgZone,
  ) {}

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onLoginWithPopUp() {
    this.authService.loginWithPopUp();
  }

  onLogout() {
    this.authService.logout();
  }

  async onSignIn(loginForm: NgForm) {
    if (!loginForm?.valid) return;

    this.isSubmitting = true;
    this.isLoginError = false;
    this.notiService.setState(false, '', false);

    try {
      await this.authService.signIn(loginForm.value.email, loginForm.value.password);
      this.zone.run(() => {
        this.isSubmitting = false;
        this.router.navigate(['/summary']);
      });
    } catch (error: any) {
      this.zone.run(() => {
        this.isLoginError = true;
        this.isSubmitting = false;
        this.errorMessage = this.mapAuthError(error);
        this.notiService.setState(true, this.errorMessage, true);
      });
    }
  }

  async onSignUp(signUpForm: NgForm) {
    if (!signUpForm?.valid) return;

    this.isSubmitting = true;
    this.isLoginError = false;
    this.notiService.setState(false, '', false);

    try {
      const user = await this.authService.signUp(
        signUpForm.value.signupEmail,
        signUpForm.value.signupPassword
      );
      await this.authService.setUpAccessData(user);
      this.authService.addNewUserCount();
      this.zone.run(() => {
        this.isSubmitting = false;
        this.router.navigate(['/summary']);
      });
    } catch (error: any) {
      this.zone.run(() => {
        this.isLoginError = true;
        this.isSubmitting = false;
        this.errorMessage = this.mapAuthError(error);
        this.notiService.setState(true, this.errorMessage, true);
      });
    }
  }

  toggleLogInView(view: string) {
    this.isLoginError = false;
    this.formIsLogin = view === 'login';
  }

  private mapAuthError(error: any): string {
    switch (error?.code) {
      case 'auth/user-not-found':
        return 'No email/password account was found for this email in PAL Database. If this account was created with Google, use Google sign-in instead.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/network-request-failed':
        return 'A network error occurred. Please check your internet and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/email-already-in-use':
        return 'The email is already in use by another account.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      default:
        return error?.message || 'An unexpected error occurred. Please try again later.';
    }
  }
}
