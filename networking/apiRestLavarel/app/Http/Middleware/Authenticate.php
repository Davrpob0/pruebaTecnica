<?php

namespace App\Http\Middleware;

use Closure;

class Authenticate
{
    /**
     * Handle an incoming request.
     *
     * Extrae el token del encabezado Authorization y lo envía a un
     * microservicio externo para su verificación.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null)
    {
        // Extraer el token del encabezado Authorization
        $token = $request->header('Authorization');
        error_log('Token recibido: ' . $token);
        if (!$token) {
            return response()->json(['error' => 'Token no proporcionado'], 401);
        }

        // Remover el prefijo "Bearer" si viene incluido
        if (strpos($token, 'Bearer ') === 0) {
            $token = trim(substr($token, 7));
        }

        // Obtener la URL del microservicio de autenticación desde las variables de entorno
        $verifyUrl = env('AUTH_SERVICE_VERIFY_URL', 'http://auth-service:3001/auth/verify-token');
        
        error_log('Verificada url');
        // Preparar la petición cURL para verificar el token
        $ch = curl_init($verifyUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                "Authorization: $token" // Envía el token como string simple
            ],
            CURLOPT_POSTFIELDS     => json_encode(['token' => $token])
        ]);
        error_log('Verificada postfields' , CURLOPT_POSTFIELDS);
        $result   = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        error_log('Verificada Close');
        // Si el microservicio no retorna un código 200, se considera que el token es inválido
        if ($httpCode !== 200) {
            return response()->json(['error' => 'Token inválido o expirado'], 401);
        }

        // Opcional: podrías decodificar el resultado y adjuntar información del usuario a la petición
        // $userData = json_decode($result, true);
        // $request->attributes->add(['user' => $userData]);

        return $next($request);
    }
}
