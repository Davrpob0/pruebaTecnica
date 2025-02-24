import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoursesService, Course } from '../../../services/courses.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-courses.component.html',
  styleUrls: ['./list-courses.component.scss']
})
export class ListCoursesComponent implements OnInit {
  courses: Course[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private coursesService: CoursesService, private router: Router) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.coursesService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar cursos:', err);
        this.error = 'Error al cargar cursos disponibles.';
        this.loading = false;
      }
    });
  }
}
