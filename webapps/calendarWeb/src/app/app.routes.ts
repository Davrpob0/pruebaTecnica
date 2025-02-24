import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ListCoursesComponent } from './pages/dashboard/list-courses/list-courses.component';
import { HomeComponent } from './pages/dashboard/home/home.component';
import { SemesterComponent } from './pages/dashboard/semester/semester.component';
import { AddCourseComponent } from './pages/dashboard/add-course/add-course.component';
import { RegisterComponent } from './pages/dashboard/register/register.component';
import { ProfileComponent } from './pages/dashboard/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'listCourses', component: ListCoursesComponent },
            { path: 'semester', component: SemesterComponent },
            { path: 'add-course', component: AddCourseComponent },
            { path: 'register', component: RegisterComponent },
            { path: 'profile', component: ProfileComponent },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
