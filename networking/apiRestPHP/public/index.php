<?php
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/db.php';

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

$app = AppFactory::create();

// ====================================================
// Middleware Global para CORS y Body Parsing
// ====================================================
$app->add(function (Request $request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});
$app->addBodyParsingMiddleware();

// Ruta OPTIONS para todas las rutas, respondiendo con cabeceras CORS y status 200
$app->options('/{routes:.+}', function (Request $request, Response $response, array $args) {
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// ====================================================
// Rutas de la API
// ====================================================

// RUTA: Obtener cursos (con o sin filtro de id_estudiante)
$app->get('/cursos', function (Request $request, Response $response) use ($pdo) {
    $params = $request->getQueryParams();
    if (isset($params['id_estudiante'])) {
        $id_estudiante = $params['id_estudiante'];
        $sql = "SELECT c.id, c.nombre, c.cupos AS total_cupos, c.disponible, c.fecha_inicio, c.fecha_final, c.horario,
                       (c.cupos - COALESCE((SELECT COUNT(*) FROM estudiantes_inscritos e WHERE e.id_curso = c.id), 0)) AS cupos_restantes
                FROM cursos_disponibles c
                INNER JOIN estudiantes_inscritos e ON c.id = e.id_curso
                WHERE e.id_estudiante = :id_estudiante";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id_estudiante' => $id_estudiante]);
        $courses = $stmt->fetchAll();
    } else {
        $sql = "SELECT c.id, c.nombre, c.cupos AS total_cupos, c.disponible, c.fecha_inicio, c.fecha_final, c.horario,
                       (c.cupos - COALESCE(COUNT(e.id), 0)) AS cupos_restantes
                FROM cursos_disponibles c
                LEFT JOIN estudiantes_inscritos e ON c.id = e.id_curso
                GROUP BY c.id, c.nombre, c.cupos, c.disponible, c.fecha_inicio, c.fecha_final, c.horario";
        $stmt = $pdo->query($sql);
        $courses = $stmt->fetchAll();
    }

    $response->getBody()->write(json_encode($courses));
    return $response->withHeader('Content-Type', 'application/json');
});

// RUTA: Crear un nuevo curso
$app->post('/cursos', function (Request $request, Response $response) use ($pdo) {
    $data = $request->getParsedBody();

    $nombre       = $data['nombre'] ?? 'Curso sin nombre';
    $cupos        = $data['total_cupos'] ?? 0;
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

// RUTA: Validar inscripción (reenvío al servicio Python)
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

// RUTA: Autenticación para Login (reenviada a auth-service - Node.js)
$app->post('/auth/login', function (Request $request, Response $response) {
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

// RUTA: Autenticación para Register (reenviada a auth-service - Node.js)
$app->post('/auth/register', function (Request $request, Response $response) {
    $url = "http://auth-service:3001/auth/register";

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

// ====================================================
// Inicia la aplicación
// ====================================================
$app->run();
