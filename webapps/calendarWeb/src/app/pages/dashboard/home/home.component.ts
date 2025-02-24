import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CoursesService, Course } from '../../../services/courses.service';
import { Router } from '@angular/router';
import { EventContentArg, EventClickArg } from '@fullcalendar/core';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userRole: string = '';
  userData: any = {};
  courses: Course[] = [];
  calendarOptions: any = {};

  constructor(private coursesService: CoursesService, private router: Router) { }

  ngOnInit(): void {
    const storedData = sessionStorage.getItem('userData');
    if (storedData) {
      this.userData = JSON.parse(storedData);
      this.userRole = this.userData.role;
      this.loadCourses();
      this.initializeCalendar();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadCourses(): void {
    if (this.userRole === 'admin') {
      // Para admin: obtener todos los cursos
      this.coursesService.getCourses().subscribe({
        next: (data) => {
          this.courses = data;
          this.initializeCalendar();
        },
        error: (err) => console.error('Error al cargar cursos:', err)
      });
    } else {
      // Para estudiantes: obtener solo los cursos en los que está inscrito
      this.coursesService.getMyCourses(this.userData.id).subscribe({
        next: (data) => {
          this.courses = data;
          this.initializeCalendar();
        },
        error: (err) => console.error('Error al cargar cursos:', err)
      });
    }
  }

  initializeCalendar(): void {
    // Función para mapear el día en español a número (domingo=0, lunes=1, etc.)
    const dayNameToNumber = (dayName: string): number | null => {
      const mapping: { [key: string]: number } = {
        "domingo": 0,
        "lunes": 1,
        "martes": 2,
        "miércoles": 3,
        "miercoles": 3,
        "jueves": 4,
        "viernes": 5,
        "sábado": 6,
        "sabado": 6
      };
      return mapping[dayName.toLowerCase()] ?? null;
    };

    // Mapea cada curso a un evento recurrente
    const events = this.courses.map(course => {
      // Suponemos que course.horario tiene el formato "Martes 09:00 - 12:00"
      const parts = course.horario.split(' ');
      if (parts.length < 4) {
        return null; // Formato inválido
      }
      const dayName = parts[0];         // "Martes"
      const startTime = parts[1];       // "09:00"
      const endTime = parts[3];         // "12:00"
      const dayNum = dayNameToNumber(dayName);
      if (dayNum === null) {
        return null;
      }

      // Calcula la duración para mostrarla en la segunda línea
      const duration = `${startTime} - ${endTime}`;

      // Ajustamos la fecha final: FullCalendar trata endRecur como exclusiva,
      // por lo que agregamos un día para que se muestre el último día de clase.
      const finalDate = new Date(course.fecha_final);
      finalDate.setDate(finalDate.getDate() + 1);
      const adjustedFechaFinal = finalDate.toISOString().split('T')[0];

      return {
        title: course.nombre,
        daysOfWeek: [dayNum],
        startTime: startTime,
        endTime: endTime,
        startRecur: course.fecha_inicio,  // Formato ISO (YYYY-MM-DD)
        endRecur: adjustedFechaFinal,       // Se suma un día para incluir el último día
        extendedProps: {
          duration: duration,
          fullInfo: course
        }
      };
    }).filter(event => event !== null);

    this.calendarOptions = {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },
      eventDisplay: 'block', // Muestra el evento como bloque
      eventContent: (arg: EventContentArg) => {
        // Crear contenedor principal con estilos ajustados
        const containerEl = document.createElement('div');
        containerEl.style.backgroundColor = '#007bff';
        containerEl.style.color = '#000';
        containerEl.style.borderRadius = '4px';
        containerEl.style.padding = '4px';
        containerEl.style.cursor = 'pointer';
        containerEl.style.userSelect = 'none';
        containerEl.style.textAlign = 'center';
        containerEl.style.width = '100%';
        containerEl.style.whiteSpace = 'normal';
        containerEl.style.wordBreak = 'break-word';
        containerEl.style.overflowWrap = 'break-word';

        // Contenedor interno (vertical)
        const innerEl = document.createElement('div');
        innerEl.style.display = 'flex';
        innerEl.style.flexDirection = 'column';
        innerEl.style.alignItems = 'center';
        innerEl.style.width = '100%';
        innerEl.style.whiteSpace = 'normal';

        // Primera línea: título
        const titleEl = document.createElement('div');
        titleEl.textContent = arg.event.title;
        titleEl.style.fontWeight = 'bold';
        titleEl.style.whiteSpace = 'normal';
        titleEl.style.width = '100%';

        // Segunda línea: duración
        const durationEl = document.createElement('div');
        durationEl.textContent = arg.event.extendedProps['duration'] || '';
        durationEl.style.fontSize = '0.9em';
        durationEl.style.whiteSpace = 'normal';
        durationEl.style.width = '100%';

        innerEl.appendChild(titleEl);
        innerEl.appendChild(durationEl);
        containerEl.appendChild(innerEl);

        return { domNodes: [containerEl] };
      },
      eventClick: (info: EventClickArg) => {
        const course = info.event.extendedProps['fullInfo'];
        Swal.fire({
          title: course.nombre,
          html: `
            <p><strong>Horario:</strong> ${course.horario}</p>
            <p><strong>Fechas:</strong> ${course.fecha_inicio} - ${course.fecha_final}</p>
            <p><strong>Cupos:</strong> ${course.cupos}</p>
          `,
          icon: 'info',
          confirmButtonText: 'Cerrar'
        });
      },
      events: events
    };
  }
}
