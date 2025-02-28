import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Course, CoursesService, Enrollment } from '../../../services/courses.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss']
})
export class AddCourseComponent implements OnInit {
  // Lista completa de cursos (cada registro representa una clase/horario)
  courses: Course[] = [];
  // Lista de nombres únicos (para seleccionar en el paso 1)
  uniqueCourseNames: string[] = [];
  // Curso (nombre) seleccionado en el paso 1
  selectedCourseName: string = '';
  // Lista de clases (horarios) filtradas según el curso seleccionado (paso 2)
  filteredClasses: Course[] = [];
  // Control de pasos: 1 = seleccionar curso; 2 = seleccionar clase/horario
  currentStep: number = 1;

  // Datos para la inscripción; nombre_estudiante e id_estudiante se obtienen de sessionStorage
  enrollment: Enrollment = {
    id_curso: 0,
    nombre_estudiante: '',
    id_estudiante: 0,
    cupos_totales: 0
  };

  enrollmentResponse: any;
  fadeResponse: boolean = false;

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
      next: (data: Course[]) => {
        this.courses = data;
        // Extraer nombres únicos de curso
        this.uniqueCourseNames = Array.from(new Set(this.courses.map(course => course.nombre)));
      },
      error: (err) => console.error('Error al cargar cursos:', err)
    });
  }

  // Paso 1: Al presionar "Siguiente" se filtran las clases disponibles para el curso seleccionado
  nextStep(): void {
    if (!this.selectedCourseName) {
      Swal.fire('Atención', 'Seleccione un curso', 'warning');
      return;
    }
    this.filteredClasses = this.courses.filter(course => course.nombre === this.selectedCourseName);
    if (this.filteredClasses.length === 0) {
      Swal.fire('Atención', 'No hay clases disponibles para este curso', 'warning');
      return;
    }
    this.currentStep = 2;
  }

  // Paso 2: Realizar la inscripción para la clase seleccionada
  enroll(selectedClass: Course): void {
    // Se asignan los datos del curso/clase seleccionado a la inscripción.
    this.enrollment.id_curso = selectedClass.id!; // Se asume que 'id' representa el identificador de la clase (o id_clase)
    this.enrollment.cupos_totales = selectedClass.total_cupos; // O el campo correspondiente
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
          text: 'Ocurrió un error al inscribirte en el curso',
          icon: 'error',
          confirmButtonText: 'Cerrar'
        }).then(() => {
          this.resetForm();
        });
      }
    });
  }

  // Volver al paso 1
  goBack(): void {
    this.currentStep = 1;
    this.selectedCourseName = '';
    this.filteredClasses = [];
  }

  resetForm(): void {
    this.currentStep = 1;
    this.selectedCourseName = '';
    this.filteredClasses = [];
    this.enrollmentResponse = null;
    this.fadeResponse = false;
  }
}
