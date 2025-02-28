import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Course, CoursesService } from '../../../services/courses.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  // Array de días disponibles
  daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Objeto para el formulario con campos separados para día, horas y profesor
  newCourse: any = {
    nombre: '',
    total_cupos: 15,
    disponible: true,
    fecha_inicio: '',
    fecha_final: '',
    dayOfWeek: 'Lunes',  // valor por defecto
    startTime: '',
    endTime: '',
    profesor: ''  // Nuevo campo para profesor
  };

  constructor(private coursesService: CoursesService) { }

  ngOnInit(): void {
    // Inicializaciones si son necesarias
  }

  createCourse(): void {
    // Validaciones básicas
    if (!this.newCourse.nombre.trim()) {
      Swal.fire('Atención', 'El nombre del curso es obligatorio', 'warning');
      return;
    }
    if (this.newCourse.total_cupos < 15 || this.newCourse.total_cupos > 35) {
      Swal.fire('Atención', 'El cupo debe estar entre 15 y 35', 'warning');
      return;
    }
    if (!this.newCourse.fecha_inicio || !this.newCourse.fecha_final) {
      Swal.fire('Atención', 'Debes seleccionar fecha de inicio y fecha final', 'warning');
      return;
    }
    if (!this.newCourse.dayOfWeek) {
      Swal.fire('Atención', 'Debes seleccionar un día de la semana', 'warning');
      return;
    }
    if (!this.newCourse.startTime || !this.newCourse.endTime) {
      Swal.fire('Atención', 'Debes seleccionar la hora de inicio y de fin', 'warning');
      return;
    }
    if (!this.newCourse.profesor.trim()) {
      Swal.fire('Atención', 'Debes ingresar el nombre del profesor', 'warning');
      return;
    }

    // Construir la cadena "horario" usando template literals correctamente
    const horario = `${this.newCourse.dayOfWeek} ${this.newCourse.startTime} - ${this.newCourse.endTime}`;

    // Preparar el objeto que se enviará al backend
    const courseData: Course = {
      nombre: this.newCourse.nombre,
      total_cupos: this.newCourse.total_cupos,
      disponible: this.newCourse.disponible,
      fecha_inicio: this.newCourse.fecha_inicio,
      fecha_final: this.newCourse.fecha_final,
      horario: horario,
      profesor: this.newCourse.profesor
    };

    // Llamar al servicio para crear el curso
    this.coursesService.addCourse(courseData).subscribe({
      next: (res) => {
        console.log('Curso creado:', res);
        Swal.fire({
          title: 'Curso creado',
          text: 'El curso se ha registrado exitosamente',
          icon: 'success',
          confirmButtonText: 'Cerrar'
        }).then(() => {
          this.resetForm();
        });
      },
      error: (err) => {
        console.error('Error al crear curso:', err);
        Swal.fire('Error', 'Ocurrió un error al registrar el curso', 'error');
      }
    });
  }

  resetForm(): void {
    this.newCourse = {
      nombre: '',
      total_cupos: 15,
      disponible: true,
      fecha_inicio: '',
      fecha_final: '',
      dayOfWeek: 'Lunes',
      startTime: '',
      endTime: '',
      profesor: ''
    };
  }
}
