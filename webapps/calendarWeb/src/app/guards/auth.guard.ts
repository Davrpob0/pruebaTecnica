// webapps/calendarWeb/src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(): boolean {
        const userData = sessionStorage.getItem('userData');
        if (!userData) {
            this.router.navigate(['/login']);
            return false;
        }
        return true;
    }
}