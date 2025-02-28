<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ValidatorController extends Controller
{
    // POST /validator
    public function validateInscription(Request $request)
    {
        $data = $request->all();

        if (!isset($data['id_curso'], $data['nombre_estudiante'], $data['id_estudiante'])) {
            return response()->json(['error' => 'Faltan campos'], 400);
        }

        // Realizamos el join entre cursos_disponibles y clases_disponibles para obtener cupos
        $course = DB::table('cursos_disponibles as c')
                    ->join('clases_disponibles as cl', 'c.id', '=', 'cl.id_curso')
                    ->select('c.id', 'c.nombre', 'cl.cupos')
                    ->where('c.id', $data['id_curso'])
                    ->first();

        if (!$course) {
            return response()->json(['error' => 'Curso no encontrado'], 404);
        }

        // Usamos el campo cupos obtenido de clases_disponibles
        $data['cupos_totales'] = $course->cupos;

        // Obtenemos la URL del servicio validador desde las variables de entorno
        $validatorUrl = env('VALIDATOR_SERVICE_URL', 'http://validator:3000/validate');

        $ch = curl_init($validatorUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => json_encode($data)
        ]);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            return response()->json(['error' => $error], 500);
        }
        curl_close($ch);

        return response()->json(json_decode($result, true));
    }
}
