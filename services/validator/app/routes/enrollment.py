from fastapi import APIRouter, HTTPException
from app.schemas import EnrollmentRequest
from app.database import get_db_connection
import datetime

router = APIRouter()

def parse_schedule(horario: str):
    parts = horario.split()
    if len(parts) < 4:
        return None, None, None
    day = parts[0]
    start_time_str = parts[1]
    end_time_str = parts[3]
    try:
        start_time = datetime.datetime.strptime(start_time_str, "%H:%M").time()
        end_time = datetime.datetime.strptime(end_time_str, "%H:%M").time()
    except Exception:
        return None, None, None
    return day, start_time, end_time

def schedules_overlap(day1, start1, end1, day2, start2, end2):
    if day1 != day2:
        return False
    return start1 < end2 and start2 < end1

@router.post("/validate")
def validate_enrollment(request: EnrollmentRequest):
    conn = get_db_connection()
    print("Database connection established")
    cur = conn.cursor()

    # 1. Verificar que el estudiante no esté ya inscrito en este horario (usando id_clase)
    cur.execute(
        "SELECT COUNT(*) AS count FROM estudiantes_inscritos WHERE id_clase = %s AND id_estudiante = %s",
        (request.id_curso, request.id_estudiante)  # request.id_curso representa el id_clase en este contexto
    )
    existing = cur.fetchone()
    if existing["count"] > 0:
        conn.close()
        return {"valid": False, "message": "El estudiante ya está inscrito en este curso."}

    # 2. Obtener la información completa del curso actual usando el id_clase
    cur.execute(
        """
        SELECT cl.id_clase, cl.cupos, cl.horario, cl.fecha_inicio, cl.fecha_final, cu.nombre
        FROM cursos_disponibles cu
        JOIN clases_disponibles cl ON cu.id = cl.id_curso
        WHERE cl.id_clase = %s
        """,
        (request.id_curso,)
    )
    course = cur.fetchone()
    if not course or not course.get("horario"):
        conn.close()
        return {"valid": False, "message": "No se encontró el horario o las fechas del curso actual."}
    
    total_cupos = course["cupos"]
    current_day, current_start, current_end = parse_schedule(course["horario"])
    if current_day is None:
        conn.close()
        return {"valid": False, "message": "Formato de horario inválido en el curso actual."}
    
    try:
        if isinstance(course["fecha_inicio"], str):
            current_start_date = datetime.datetime.strptime(course["fecha_inicio"], "%Y-%m-%d").date()
        else:
            current_start_date = course["fecha_inicio"]
        if isinstance(course["fecha_final"], str):
            current_end_date = datetime.datetime.strptime(course["fecha_final"], "%Y-%m-%d").date()
        else:
            current_end_date = course["fecha_final"]
    except Exception as e:
        conn.close()
        return {"valid": False, "message": f"Error al procesar las fechas del curso actual: {str(e)}"}
    
    current_course_name = course["nombre"]

    # 3. Validar que el estudiante no esté inscrito en otro curso con el mismo nombre
    query = """
    SELECT cu.nombre
    FROM estudiantes_inscritos e
    JOIN clases_disponibles cl ON e.id_clase = cl.id_clase
    JOIN cursos_disponibles cu ON cl.id_curso = cu.id
    WHERE e.id_estudiante = %s AND cu.nombre = %s
    """
    cur.execute(query, (request.id_estudiante, current_course_name))
    duplicate = cur.fetchone()
    if duplicate:
        conn.close()
        return {"valid": False, "message": "El estudiante ya está inscrito en otro curso con el mismo nombre."}

    # 4. Validar cupos: contar inscripciones en el horario (id_clase)
    cur.execute("SELECT COUNT(*) AS count FROM estudiantes_inscritos WHERE id_clase = %s", (course["id_clase"],))
    result = cur.fetchone()
    current_count = result["count"]
    if current_count >= total_cupos:
        conn.close()
        return {"valid": False, "message": "Cupo máximo alcanzado para este curso."}

    new_cupo = current_count + 1

    # 5. Insertar la inscripción utilizando el nuevo cupo, registrando el id_clase.
    insert_sql = """
        INSERT INTO estudiantes_inscritos (id_clase, nombre_estudiante, id_estudiante, cupo)
        VALUES (%s, %s, %s, %s) RETURNING id_clase, id_estudiante;
    """
    try:
        cur.execute(insert_sql, (course["id_clase"], request.nombre_estudiante, request.id_estudiante, new_cupo))
        returned = cur.fetchone()
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al registrar la inscripción: {str(e)}")

    conn.close()
    enrollment_id = f"{returned['id_clase']}-{returned['id_estudiante']}"

    return {
        "valid": True,
        "message": "Inscripción registrada exitosamente.",
        "enrollment_id": enrollment_id
    }
