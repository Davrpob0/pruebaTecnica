// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface LoginResponse {
  token: string;
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export interface RegisterResponse {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
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
  private baseUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) { }

  private extractJson<T>(responseText: string): T {
    // Busca el primer carácter '{' y extrae desde allí
    const jsonStart = responseText.indexOf('{');
    const jsonStr = jsonStart !== -1 ? responseText.substring(jsonStart) : responseText;
    return JSON.parse(jsonStr);
  }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    // Se solicita la respuesta como texto para poder limpiar el "echo" extra
    return this.http.post(`${this.baseUrl}/login`, credentials, { responseType: 'text' }).pipe(
      map(responseText => this.extractJson<LoginResponse>(responseText))
    );
  }

  register(data: RegisterData): Observable<RegisterResponse> {
    // Se solicita la respuesta como texto para poder limpiar el "echo" extra
    return this.http.post(`${this.baseUrl}/register`, data, { responseType: 'text' }).pipe(
      map(responseText => this.extractJson<RegisterResponse>(responseText))
    );
  }
}
