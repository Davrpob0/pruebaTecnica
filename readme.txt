# Prueba Técnica

Este proyecto incluye servicios en PHP, Node.js, Python y una aplicación web en Angular. A continuación se detalla cómo inicializar la descripción del proyecto, configurar las variables de entorno y levantar el proyecto.

## Descripción

El proyecto consta de los siguientes componentes:

- **API REST en PHP:** ubicada en [networking/apiRestPHP](networking/apiRestPHP). Este servicio utiliza una base de datos PostgreSQL para gestionar cursos y usuarios.
- **Servicio de Autenticación (Node.js):** ubicado en [services/auth](services/auth). Se encarga del login y registro de usuarios, utilizando Redis para el almacenamiento de sesiones.
- **Validador (Python):** Está configurado para validar inscripciones.
- **Aplicación Web Angular (CalendarWeb):** ubicada en [webapps/calendarWeb](webapps/calendarWeb), expuesta con Nginx en producción y gestionada con Angular CLI en desarrollo.

## Variables de Entorno

Para inicializar el proyecto, se deben configurar los siguientes valores:

- **Variables para la Base de Datos (PostgreSQL):**
  - `DB_HOST`
  - `DB_PORT`
  - `DB_NAME`
  - `DB_USER` (o `DB_USERNAME`)
  - `DB_PASS` (o `DB_PASSWORD`)

- **Variables para Redis & Sesiones (Servicio de Autenticación):**
  - `REDIS_URL`
  - `REDIS_PASSWORD`
  - `SESSION_SECRET`

- **Variables adicionales para el Servicio de Autenticación:**
  - `JWT_SECRET`
  - `JWT_EXPIRATION`
  - `PORT` (puerto del servicio, por defecto 3001)

> Copia el contenido de [`.env.example`](.env.example) a [`.env`](.env) y ajusta los valores según tu entorno local.

## Inicialización del Proyecto

1. **Configura las variables de entorno:**  
   Copia el contenido del archivo [`.env.example`](.env.example) a [`.env`](.env) y edita los valores según tu configuración local.

2. **Levanta la base de datos (opcional):**  
   Si fuera necesario, inicializa la base de datos ejecutando el script en [db/init.sql](db/init.sql).

3. **Construye y levanta todos los servicios:**  
   Ejecuta el siguiente comando en la raíz del proyecto:
   ```sh
   docker-compose up --build