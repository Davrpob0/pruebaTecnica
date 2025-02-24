// src/app/pages/dashboard/semester/semester.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesService, Course } from '../../../services/courses.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-semester',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './semester.component.html',
  styleUrls: ['./semester.component.scss']
})
export class SemesterComponent implements OnInit {
  studentId: number = 0;
  courses: Course[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private coursesService: CoursesService, private router: Router) { }

  ngOnInit(): void {
    const storedData = sessionStorage.getItem('userData');
    if (storedData) {
      const userData = JSON.parse(storedData);
      if (userData && userData.id) {
        this.studentId = userData.id;
        this.loadMyCourses();
      } else {
        this.router.navigate(['/login']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadMyCourses(): void {
    this.loading = true;
    this.coursesService.getMyCourses(this.studentId).subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar cursos:', err);
        this.error = 'Error al cargar los cursos.';
        this.loading = false;
      }
    });
  }
}
