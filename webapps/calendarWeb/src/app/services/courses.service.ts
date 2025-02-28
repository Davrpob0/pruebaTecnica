import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Course {
  id_curso?: string;
  id_clase?: string;
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
  id_curso: string;      // Identificador del curso (varchar(5))
  id_clase: string;      // Identificador de la clase (varchar(5))
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
      map(responseText => {
        const courses: any[] = this.extractJson<any[]>(responseText);
        return courses.map(course => ({
          id_curso: course.course_id, // Mapear course_id a id_curso
          id_clase: course.class_id,   // Mapear class_id a id_clase
          nombre: course.nombre,
          total_cupos: course.total_cupos,
          disponible: course.disponible,
          fecha_inicio: course.fecha_inicio,
          fecha_final: course.fecha_final,
          horario: course.horario,
          profesor: course.profesor,
          cupos_restantes: course.cupos_restantes
        }));
      })
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
