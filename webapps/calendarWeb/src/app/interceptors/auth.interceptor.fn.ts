// src/app/interceptors/auth.interceptor.fn.ts
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

    // Si la URL es para login o register, no agregar el header de autorización.
    if (!req.url.endsWith('/auth/login') && !req.url.endsWith('/auth/register')) {
        const token = sessionStorage.getItem('token');
        if (token) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Interceptor (funcional): Token agregado', token);
        } else {
            console.warn('Interceptor (funcional): No se encontró token en sessionStorage');
        }
    }

    return next(req);
};
