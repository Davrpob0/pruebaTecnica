import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Course {
  id?: number;
  nombre: string;
  total_cupos: number;
  disponible: boolean;
  fecha_inicio: string;
  fecha_final: string;
  horario: string;
  profesor: string;
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
  private baseUrl = 'http://localhost:8080'; // Usa un dominio que el navegador reconozca

  constructor(private http: HttpClient) { }

  private extractJson<T>(responseText: string): T {
    // Se busca el primer carácter '{' o '[' para identificar el inicio del JSON
    const indexCurly = responseText.indexOf('{');
    const indexSquare = responseText.indexOf('[');
    let jsonStart = -1;
    if (indexCurly === -1 && indexSquare === -1) {
      throw new Error('No se encontró JSON en la respuesta');
    } else if (indexCurly === -1) {
      jsonStart = indexSquare;
    } else if (indexSquare === -1) {
      jsonStart = indexCurly;
    } else {
      jsonStart = Math.min(indexCurly, indexSquare);
    }
    const jsonStr = responseText.substring(jsonStart);
    return JSON.parse(jsonStr);
  }

  // Obtiene la lista de cursos
  getCourses(): Observable<Course[]> {
    return this.http.get(`${this.baseUrl}/cursos`, { responseType: 'text' }).pipe(
      map(responseText => this.extractJson<Course[]>(responseText))
    );
  }

  // Crea un nuevo curso
  addCourse(course: Course): Observable<Course> {

    return this.http.post(`${this.baseUrl}/cursos`, course, { responseType: 'text' }).pipe(
      map(responseText => this.extractJson<Course>(responseText))
    );
  }

  // Envía la inscripción para validarla
  enrollStudent(enrollment: Enrollment): Observable<any> {

    return this.http.post(`${this.baseUrl}/validator`, enrollment, { responseType: 'text' }).pipe(
      map(responseText => this.extractJson<any>(responseText))
    );
  }

  getMyCourses(studentId: number): Observable<Course[]> {

    return this.http.get<Course[]>(`${this.baseUrl}/cursos?id_estudiante=${studentId}`);
  }

}
