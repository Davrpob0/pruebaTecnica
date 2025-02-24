// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginResponse, RegisterData } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };

  registerData: RegisterData = {
    username: '',
    password: '',
    email: '',
    role: ''
  };

  loginResponse?: LoginResponse;
  loading = false;
  isRegistering = false;

  constructor(private authService: AuthService, private router: Router) { }

  showRegisterForm(): void {
    this.isRegistering = true;
  }

  showLoginForm(): void {
    this.isRegistering = false;
  }

  login(): void {
    this.loading = true;
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.loading = false;
        this.loginResponse = res;
        if (!res.error && res.user) {
          sessionStorage.setItem('userData', JSON.stringify(res.user));
          if (res.token) {
            sessionStorage.setItem('token', res.token);
          }
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.loginResponse = { error: 'Error al iniciar sesión', message: '' };
        this.loading = false;
      }
    });
  }

  register(): void {
    this.loading = true;
    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        this.loading = false;
        this.loginResponse = res;
        if (!res.error && res.user) {
          sessionStorage.setItem('userData', JSON.stringify(res.user));
          if (res.token) {
            sessionStorage.setItem('token', res.token);
          }
          this.router.navigate(['/dashboard']);
        }
        this.showLoginForm();
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.loginResponse = { error: 'Error al registrar usuario', message: '' };
        this.loading = false;
      }
    });
  }
}
