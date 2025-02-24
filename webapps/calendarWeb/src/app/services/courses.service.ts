// src/app/services/courses.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id?: number;
  nombre: string;
  total_cupos: number;
  disponible: boolean;
  fecha_inicio: string;
  fecha_final: string;
  horario: string;
  cupos_restantes?: number; // campo calculado
}



export interface Enrollment {
  id_curso: number;
  nombre_estudiante: string;
  id_estudiante: number;
  cupos_totales: number;
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  private baseUrl = 'http://php-api:8080'; // Ajusta la URL según tu entorno

  constructor(private http: HttpClient) { }

  // Obtiene la lista de cursos
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/cursos`);
  }

  // Crea un nuevo curso
  addCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(`${this.baseUrl}/cursos`, course);
  }

  // Envía la inscripción para validarla (PHP la reenvía a Python)
  enrollStudent(enrollment: Enrollment): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/validator`, enrollment);
  }

  getMyCourses(studentId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/courses/my-courses?id_estudiante=${studentId}`);
  }
}
