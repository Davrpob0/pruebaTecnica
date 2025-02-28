# Prueba Técnica

Este proyecto integra diversos microservicios y una aplicación web, cada uno desarrollado con tecnologías específicas:

- **API REST en PHP:**  
  Ubicada en `networking/apiRestPHP`, utiliza PHP 8.1 con Apache y PostgreSQL para gestionar cursos y usuarios.

- **Servicio de Autenticación (Node.js):**  
  Ubicado en `services/auth`, se encarga del login y registro de usuarios, aprovechando Redis para sesiones y almacenamiento.

- **Validador (Python):**  
  Ubicado en `services/validator`, valida inscripciones utilizando Python y Uvicorn.

- **Aplicación Web Angular (CalendarWeb):**  
  Ubicada en `webapps/calendarWeb`, se construye con Angular y se expone mediante Nginx.

---

## Tecnologías Requeridas

Para levantar el proyecto con Docker Compose, asegúrate de tener instaladas las siguientes herramientas en tu ordenador:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

Si deseas editar o ejecutar algunos de los microservicios localmente, también necesitarás:

- **Node.js y npm** (para la aplicación Angular y el servicio de autenticación).
- **PHP** (para modificar y correr localmente la API REST).
- **Python** (y pip, para el servicio de validación).

---

## Configuración de Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto.  
   Puedes partir copiando el contenido del archivo [.env.example](.env.example):

   ```sh
   cp .env.example .env

2. levanta el proyecto con docker-compose up --build -d
(revisa que los puertos que se exponen no esten sinedo utilizados localmente)