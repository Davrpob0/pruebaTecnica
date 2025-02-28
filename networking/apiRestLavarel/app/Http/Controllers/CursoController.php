<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CursoController extends Controller
{
    public function index(Request $request)
    {
        $idEstudiante = $request->query('id_estudiante');
        error_log("CursoController@index llamado. id_estudiante: " . ($idEstudiante ?? 'null'));
    
        if ($idEstudiante) {
            error_log("Consultando cursos para el estudiante con id: " . $idEstudiante);
            $courses = DB::select(
                "SELECT cl.id_clase AS id, cu.nombre, cl.profesor, 
                        cl.cupos AS total_cupos, cl.fecha_inicio, cl.fecha_final, cl.horario,
                        (cl.cupos - COALESCE(
                            (SELECT COUNT(*) FROM estudiantes_inscritos e WHERE e.id_clase = cl.id_clase), 0)
                        ) AS cupos_restantes
                 FROM clases_disponibles cl
                 INNER JOIN cursos_disponibles cu ON cl.id_curso = cu.id
                 INNER JOIN estudiantes_inscritos e ON cl.id_clase = e.id_clase
                 WHERE e.id_estudiante = ?",
                [$idEstudiante]
            );
            error_log("Consulta ejecutada. Número de cursos obtenidos: " . count($courses));
        } else {
            error_log("Consultando todos los cursos.");
            $courses = DB::select(
                "SELECT cl.id_clase AS id, cu.nombre, cl.profesor, 
                        cl.cupos AS total_cupos, cl.fecha_inicio, cl.fecha_final, cl.horario,
                        (cl.cupos - COALESCE(COUNT(e.id_estudiante), 0)) AS cupos_restantes
                 FROM clases_disponibles cl
                 INNER JOIN cursos_disponibles cu ON cl.id_curso = cu.id
                 LEFT JOIN estudiantes_inscritos e ON cl.id_clase = e.id_clase
                 GROUP BY cl.id_clase, cu.nombre, cl.profesor, cl.cupos, cl.fecha_inicio, cl.fecha_final, cl.horario"
            );
            error_log("Consulta ejecutada. Número de cursos obtenidos: " . count($courses));
        }
    
        error_log("Retornando respuesta JSON con cursos.");
        return response()->json($courses);
    }
    




    public function store(Request $request)
    {
        $data = $request->all();
        error_log("CursoController@store llamado. Datos recibidos: " . json_encode($data));
        
        $nombre = $data['nombre'] ?? 'Curso sin nombre';
        $profesor = $data['profesor'] ?? 'Profesor no especificado';
        $cupos = $data['total_cupos'] ?? 0;
        $disponible = $data['disponible'] ?? true;
        $fecha_inicio = $data['fecha_inicio'] ?? date('Y-m-d');
        $fecha_final = $data['fecha_final'] ?? date('Y-m-d');
        $horario = $data['horario'] ?? 'Horario no especificado';
    
        $cursoId = Str::random(5);
        $claseId = Str::random(5);
    
        DB::beginTransaction();
        try {
            DB::table('cursos_disponibles')->insert([
                'id' => $cursoId,
                'nombre' => $nombre
            ]);
    
            DB::table('clases_disponibles')->insert([
                'id_clase' => $claseId,
                'id_curso' => $cursoId,
                'profesor' => $profesor,
                'cupos' => $cupos,
                'fecha_inicio' => $fecha_inicio,
                'fecha_final' => $fecha_final,
                'horario' => $horario
            ]);
    
            DB::commit();
    
            error_log("Curso y clase insertados correctamente. ID curso: $cursoId, ID clase: $claseId");
    
            return response()->json([
                'curso_id' => $cursoId,
                'clase_id' => $claseId
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            error_log("Error al insertar curso y clase: " . $e->getMessage());
            return response()->json(['error' => 'Error al insertar curso y clase'], 500);
        }
    }
}
