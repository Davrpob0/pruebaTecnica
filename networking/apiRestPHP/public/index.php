<?php

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/db.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

$app = AppFactory::create();

$app->addBodyParsingMiddleware();

// Middleware general para agregar headers CORS
$app->add(function (Request $request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});


// ---------------------- Rutas definidas claramente ----------------------

$app->get('/cursos', function (Request $request, Response $response) use ($pdo) {
    $sql = "SELECT c.id, c.nombre, c.cupos AS total_cupos, c.disponible, c.fecha_inicio, c.fecha_final, c.horario,
                   (c.cupos - COALESCE(COUNT(e.id), 0)) AS cupos_restantes
            FROM cursos_disponibles c
            LEFT JOIN estudiantes_inscritos e ON c.id = e.id_curso
            GROUP BY c.id, c.nombre, c.cupos, c.disponible, c.fecha_inicio, c.fecha_final, c.horario";

    $stmt = $pdo->query($sql);
    $cursos = $stmt->fetchAll();

    $response->getBody()->write(json_encode($cursos));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/cursos', function (Request $request, Response $response) use ($pdo) {
    $data = $request->getParsedBody();

    $nombre       = $data['nombre'] ?? 'Curso sin nombre';
    $cupos        = $data['cupos'] ?? 0;
    $disponible   = $data['disponible'] ?? true;
    $fecha_inicio = $data['fecha_inicio'] ?? date('Y-m-d');
    $fecha_final  = $data['fecha_final'] ?? date('Y-m-d');
    $horario      = $data['horario'] ?? 'Horario no especificado';

    $sql = "INSERT INTO cursos_disponibles 
            (nombre, cupos, disponible, fecha_inicio, fecha_final, horario)
            VALUES (:nombre, :cupos, :disponible, :fecha_inicio, :fecha_final, :horario)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute(compact('nombre', 'cupos', 'disponible', 'fecha_inicio', 'fecha_final', 'horario'));

    $response->getBody()->write(json_encode(['id' => $pdo->lastInsertId()]));
    return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
});

$app->post('/validator', function (Request $request, Response $response) use ($pdo) {
    $data = $request->getParsedBody();

    if (!isset($data['id_curso'], $data['nombre_estudiante'], $data['id_estudiante'])) {
        $response->getBody()->write(json_encode(['error' => 'Faltan campos']));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $stmt = $pdo->prepare("SELECT cupos FROM cursos_disponibles WHERE id = ?");
    $stmt->execute([$data['id_curso']]);
    $course = $stmt->fetch();

    if (!$course) {
        $response->getBody()->write(json_encode(['error' => 'Curso no encontrado']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }

    $data['cupos_totales'] = $course['cupos'];

    $ch = curl_init('http://validator:3000/validate');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($data),
    ]);

    $result = curl_exec($ch);

    if (curl_errno($ch)) {
        $response->getBody()->write(json_encode(['error' => curl_error($ch)]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    curl_close($ch);

    $response->getBody()->write($result);
    return $response->withHeader('Content-Type', 'application/json');
});

// Autenticación reenviada a microservicio Node.js
$app->post('/auth/login', function (Request $request, Response $response, array $args) {

    $url = "http://auth-service:3001/auth/login";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($request->getParsedBody()),
    ]);

    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        $response->getBody()->write(json_encode(['error' => curl_error($ch)]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }

    curl_close($ch);

    $response->getBody()->write($result);
    return $response->withHeader('Content-Type', 'application/json');
});

$app->post('/auth/register', function (Request $request, Response $response, array $args) {
    $url = "http://auth-service:3001/auth/register"; // Asegúrate de que esta URL sea la correcta para el registro

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($request->getParsedBody()),
    ]);

    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        $response->getBody()->write(json_encode(['error' => curl_error($ch)]));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
    curl_close($ch);

    $response->getBody()->write($result);
    return $response->withHeader('Content-Type', 'application/json');
});

$app->run();