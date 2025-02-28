import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginResponse } from '../../services/auth.service';
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

  loginResponse?: LoginResponse;
  errorMessage?: string;
  loading = false;

  constructor(private authService: AuthService, private router: Router) { }

  login(): void {
    this.loading = true;
    this.errorMessage = undefined;
    this.authService.login(this.credentials).subscribe({
      next: (res: LoginResponse) => {
        this.loading = false;
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
}
