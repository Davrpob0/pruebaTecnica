<?php
$host = getenv('DB_HOST');
$port = getenv('DB_PORT');
$dbname = getenv('DB_NAME');
$user = getenv('DB_USERNAME');
$pass = getenv('DB_PASSWORD');

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    // No se envía salida extra
} catch (PDOException $e) {
    exit('Error de conexión PHP: ' . $e->getMessage());
}
