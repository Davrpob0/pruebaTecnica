// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginResponse, RegisterResponse, RegisterData } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // Datos para login
  credentials = {
    username: '',
    password: ''
  };

  // Datos para registro
  registerData: RegisterData = {
    username: '',
    password: '',
    email: '',
    role: ''
  };

  // Variables separadas para almacenar las respuestas y errores de cada proceso
  loginResponse?: LoginResponse;
  registerResponse?: RegisterResponse;
  errorMessage?: string; // <-- Propiedad agregada

  loading = false;
  isRegistering = false;

  constructor(private authService: AuthService, private router: Router) { }

  showRegisterForm(): void {
    this.isRegistering = true;
    this.errorMessage = undefined;
    this.loginResponse = undefined;
  }

  showLoginForm(): void {
    this.isRegistering = false;
    this.errorMessage = undefined;
    this.registerResponse = undefined;
  }

  login(): void {
    this.loading = true;
    this.errorMessage = undefined;
    this.authService.login(this.credentials).subscribe({
      next: (res: LoginResponse) => {
        this.loading = false;
        // Se espera que el login devuelva 'user' y 'token'
        if (res.user.username && res.token) {
          sessionStorage.setItem('userData', JSON.stringify(res.user));
          sessionStorage.setItem('token', res.token);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = res.message || 'La respuesta del servidor no tiene la estructura esperada para login.';
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorMessage = 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }

  register(): void {
    this.loading = true;
    this.errorMessage = undefined;
    this.authService.register(this.registerData).subscribe({
      next: (res: RegisterResponse) => {
        this.loading = false;
        // Para el registro se considera exitoso si se recibe el objeto 'user'
        if (res.user.username) {
          this.registerResponse = res;
          // Se muestra el formulario de login para que el usuario inicie sesión
          this.showLoginForm();
        } else {
          this.errorMessage = res.message || 'La respuesta del servidor no tiene la estructura esperada para registro.';
        }
      },
      error: (err) => {
        console.error('Error en registro:', err);
        this.errorMessage = 'Error al registrar usuario';
        this.loading = false;
      }
    });
  }
}
