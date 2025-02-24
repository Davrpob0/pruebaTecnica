import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token?: string;
  message: string;
  user?: {
    username: string;
    role: string;
  };
  error?: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajusta la URL base según tu configuración; aquí usamos el proxy PHP en localhost:8080
  private baseUrl = 'http://localhost:8080/auth';


  constructor(private http: HttpClient) { }

  // Login sin requerir el campo "role"
  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials);
  }

  // Registro de un usuario (admin o student)
  register(data: RegisterData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, data);
  }
}
