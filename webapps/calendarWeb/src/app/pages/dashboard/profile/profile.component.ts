// src/app/pages/dashboard/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesService, Course } from '../../../services/courses.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userData: any = {};
  enrolledCourses: Course[] = [];
  coursesCount: number = 0;
  loading: boolean = false;
  error: string = '';

  constructor(private coursesService: CoursesService, private router: Router) { }

  ngOnInit(): void {
    const storedData = sessionStorage.getItem('userData');
    if (storedData) {
      this.userData = JSON.parse(storedData);
      // Solo cargar cursos inscritos si el usuario es estudiante
      if (this.userData.role !== 'admin') {
        this.loadEnrolledCourses();
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadEnrolledCourses(): void {
    this.loading = true;
    // Usamos el id del usuario guardado en sessionStorage para obtener sus cursos
    this.coursesService.getMyCourses(this.userData.id).subscribe({
      next: (data) => {
        this.enrolledCourses = data;
        this.coursesCount = data.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar cursos inscritos:', err);
        this.error = 'Error al cargar cursos inscritos.';
        this.loading = false;
      }
    });
  }
}
