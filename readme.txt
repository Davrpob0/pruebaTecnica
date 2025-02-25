# Prueba Técnica

Este proyecto integra diversos microservicios y una aplicación web, cada uno desarrollado con tecnologías específicas:

- **API REST en PHP:**  
  Ubicada en [networking/apiRestPHP](networking/apiRestPHP), utiliza PHP 8.1 con Apache y PostgreSQL para gestionar cursos y usuarios.
  
- **Servicio de Autenticación (Node.js):**  
  Ubicado en [services/auth](services/auth), se encarga del login y registro de usuarios, aprovechando Redis para sesión y almacenamiento.
  
- **Validador (Python):**  
  Ubicado en [services/validator](services/validator), se encarga de validar inscripciones utilizando Python y Uvicorn.
  
- **Aplicación Web Angular (CalendarWeb):**  
  Ubicada en [webapps/calendarWeb](webapps/calendarWeb), se construye con Angular y se expone mediante Nginx.

---

## Tecnologías Requeridas

Para levantar el proyecto con Docker Compose, asegúrate de tener instaladas las siguientes tecnologías en tu ordenador:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

Además, si deseas editar o ejecutar algunos de los microservicios localmente, deberás contar opcionalmente con:

- **Node.js y npm** para la aplicación Angular y el servicio de autenticación.
- **PHP** para modificar y correr localmente la API REST.
- **Python** (y pip) para el servicio de validación.

---

## Configuración de Variables de Entorno

1. Copia el contenido de [`.env.example`](.env.example) a [`.env`](.env):
   ```sh
   cp .env.example .env



Cómo Levantar el Proyecto con Docker Compose
Sigue estos pasos para construir y levantar todo el entorno:

Abre una terminal en la raíz del proyecto
Navega al directorio raíz donde se encuentra el archivo docker-compose.yml.

Construir y levantar los contenedores
Ejecuta el siguiente comando: docker-compose up --build

Este comando: 

Construirá las imágenes de Docker si es necesario.
Levantará los contenedores definidos en docker-compose.yml, que incluyen:
db: Contenedor de PostgreSQL.
redis: Contenedor de Redis.
php-api: API REST en PHP.
auth-service: Servicio de autenticación en Node.js.
validator: Servicio de validación en Python.
frontend: Aplicación Angular servida por Nginx.
Verifica que todos los contenedores estén en ejecución
Utiliza el comando: docker-compose ps

para confirmar que cada servicio se ha iniciado correctamente.

Accede a los distintos servicios:

API REST en PHP: http://localhost:8080
Servicio de Autenticación: http://localhost:3001
Validador: http://localhost:3000
Aplicación Angular: http://localhost:4200
Registro de Usuarios:

El registro de usuarios (tanto estudiantes como administradores) se realiza a través del microservicio de autenticación.
Las contraseñas se almacenan cifradas, por lo que no es necesario insertar usuarios manualmente desde el script de inicialización.
Notas Adicionales
Edición y Desarrollo Local:
Si deseas modificar la aplicación Angular, el servicio de autenticación, la API REST o el validador fuera de Docker, asegúrate de tener instaladas las tecnologías opcionales mencionadas (Node.js, PHP y Python).

Logs y Resolución de Problemas:
En caso de errores (por ejemplo, problemas de conexión o CORS), consulta los logs de cada contenedor con:

o revisa los archivos de log específicos de cada servicio.

Actualización de Variables de Entorno:
Mantén la consistencia entre el archivo .env y .env.example para evitar conflictos de configuración.

Con estos pasos y requerimientos, deberías poder levantar y utilizar el proyecto de manera exitosa en tu entorno local.