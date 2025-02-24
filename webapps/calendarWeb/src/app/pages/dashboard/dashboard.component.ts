// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userData: any = {};
  userRole: string = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    const storedData = sessionStorage.getItem('userData');
    if (storedData) {
      this.userData = JSON.parse(storedData);
      this.userRole = this.userData.role;
    } else {
      // Si no hay datos, redirigir al login
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  navigateTo(action: string): void {
    // Navega a la ruta hija dentro de dashboard
    this.router.navigate(['/dashboard', action]);
  }
}
