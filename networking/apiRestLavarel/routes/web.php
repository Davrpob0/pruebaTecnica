<?php

/** @var \Laravel\Lumen\Routing\Router $router */

// Ruta OPTIONS global para responder a solicitudes pre-flight CORS
$router->options('/{any:.*}', function () {
    return response('', 200)
           ->header('Access-Control-Allow-Origin', '*')
           ->header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
           ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// Grupo de rutas con middleware CORS (si no lo has aplicado globalmente)
$router->group(['middleware' => 'cors'], function () use ($router) {

    // Rutas públicas de autenticación (no requieren token)
    $router->post('auth/login', 'AuthController@login');
    $router->post('auth/register', 'AuthController@register');

    // Rutas protegidas que requieren verificación del token
    // Se asume que el middleware "auth" personalizado (que consulta a tu microservicio)
    // está registrado en bootstrap/app.php o en el kernel.
    $router->group(['middleware' => ['cors','auth']], function () use ($router) {
        // Obtener cursos (opcionalmente filtrando por id_estudiante)
        $router->get('cursos', 'CursoController@index');

        // Crear un nuevo curso
        $router->post('cursos', 'CursoController@store');

        // Validar inscripción (redirecciona al microservicio de validación)
        $router->post('validator', 'ValidatorController@validateInscription');
    });
});
