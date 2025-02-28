import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterResponse, RegisterData } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-u',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-u.component.html',
  styleUrls: ['./register-u.component.scss']
})
export class RegisterUComponent {
  registerData: RegisterData = {
    username: '',
    password: '',
    email: '',
    role: ''
  };

  registerResponse?: RegisterResponse;
  errorMessage?: string;
  loading = false;

  constructor(private authService: AuthService, private router: Router) { }

  register(): void {
    this.loading = true;
    this.errorMessage = undefined;
    this.authService.register(this.registerData).subscribe({
      next: (res: RegisterResponse) => {
        this.loading = false;
        if (res.user.username) {
          this.registerResponse = res;
          // Puedes redirigir o limpiar el formulario si lo deseas.
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
