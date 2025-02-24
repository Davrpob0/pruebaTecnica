import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService, Course, Enrollment } from '../../../services/courses.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss']
})
export class AddCourseComponent implements OnInit {
  courses: Course[] = [];
  selectedCourse?: Course;
  enrollmentResponse: any;
  fadeResponse: boolean = false; // Controla la animación de desvanecimiento

  // Datos para la inscripción; nombre_estudiante e id_estudiante se obtienen de sessionStorage
  enrollment: Enrollment = {
    id_curso: 0,
    nombre_estudiante: '',
    id_estudiante: 0,
    cupos_totales: 0
  };

  constructor(private coursesService: CoursesService) { }

  ngOnInit(): void {
    this.loadCourses();
    const storedData = sessionStorage.getItem('userData');
    if (storedData) {
      const user = JSON.parse(storedData);
      this.enrollment.nombre_estudiante = user.username;
      this.enrollment.id_estudiante = user.id;
    }
  }

  loadCourses(): void {
    this.coursesService.getCourses().subscribe({
      next: (data) => (this.courses = data),
      error: (err) => console.error('Error al cargar cursos:', err)
    });
  }

  onSelectCourse(course: Course): void {
    this.selectedCourse = course;
    this.enrollment.id_curso = course.id!;
    this.enrollment.cupos_totales = course.total_cupos;
  }

  enroll(): void {
    if (!this.selectedCourse) {
      Swal.fire('Atención', 'Seleccione un curso primero', 'warning');
      return;
    }
    // Muestra el popup de confirmación
    Swal.fire({
      title: 'Confirmar inscripción',
      text: `¿Desea inscribir la materia: ${this.selectedCourse.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, inscribir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.coursesService.enrollStudent(this.enrollment).subscribe({
          next: (res) => {
            this.enrollmentResponse = res;
            Swal.fire({
              title: res.valid ? 'Inscripción exitosa' : 'Error en la inscripción',
              text: res.message,
              icon: res.valid ? 'success' : 'error',
              confirmButtonText: 'Cerrar'
            }).then(() => {
              this.resetForm();
            });
          },
          error: (err) => {
            console.error('Error al inscribir estudiante:', err);
            Swal.fire({
              title: 'Error',
              text: 'Error al inscribir la materia',
              icon: 'error',
              confirmButtonText: 'Cerrar'
            }).then(() => {
              this.resetForm();
            });
          }
        });
      }
    });
  }

  resetForm(): void {
    // Deselecciona el curso y reinicia los datos de inscripción (excepto los del usuario)
    this.selectedCourse = undefined;
    this.enrollment.id_curso = 0;
    this.enrollment.cupos_totales = 0;
    this.enrollmentResponse = null;
    this.fadeResponse = false;
  }
}
