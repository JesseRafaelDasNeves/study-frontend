import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { FloatingSettingsComponent } from '../../../layout/components/floating-settings/floating-settings.component';
import { AuthService } from '@services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
    FloatingSettingsComponent,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  checked: boolean = false;

  loginFailed = signal(false);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate(['/']);
    }
  }

  login() {
    // Lógica de login aqui
    const success = this.authService.login(this.email, this.password);

    if (success) {
      this.loginFailed.set(false);
      void this.router.navigate(['/']);
    } else {
      this.email = '';
      this.password = '';
      this.loginFailed.set(true);
    }
  }
}
