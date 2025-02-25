from fastapi import APIRouter, HTTPException
from app.schemas import EnrollmentRequest
from app.database import get_db_connection
import datetime

router = APIRouter()

def parse_schedule(horario: str):
    """
    Recibe un horario en el formato "Martes 09:00 - 12:00"
    y retorna (día, hora_inicio, hora_fin) como objetos:
    ("Martes", time(9,0), time(12,0))
    """
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
    # Los intervalos se superponen si: inicio1 < fin2 y inicio2 < fin1.
    return start1 < end2 and start2 < end1

@router.post("/validate")
def validate_enrollment(request: EnrollmentRequest):
    conn = get_db_connection()
    print("Database connection established")
    cur = conn.cursor()

    # 1. Verificar que el estudiante no esté ya inscrito en el mismo curso.
    cur.execute(
        "SELECT COUNT(*) AS count FROM estudiantes_inscritos WHERE id_curso = %s AND id_estudiante = %s",
        (request.id_curso, request.id_estudiante)
    )
    existing = cur.fetchone()
    if existing["count"] > 0:
        conn.close()
        return {"valid": False, "message": "El estudiante ya está inscrito en este curso."}

    # 2. Obtener el total de cupos, el horario y las fechas del curso actual.
    cur.execute(
        "SELECT cupos, horario, fecha_inicio, fecha_final FROM cursos_disponibles WHERE id = %s",
        (request.id_curso,)
    )
    course = cur.fetchone()
    if not course or not course.get("horario"):
        conn.close()
        return {"valid": False, "message": "No se encontró el horario o las fechas del curso actual."}
    
    total_cupos = course["cupos"]

    # Parsear el horario para validar solapamientos de tiempo
    current_day, current_start, current_end = parse_schedule(course["horario"])
    if current_day is None:
        conn.close()
        return {"valid": False, "message": "Formato de horario inválido en el curso actual."}
    
    # 3. Procesar las fechas del curso actual.
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

    # 4. Validar que el estudiante no esté inscrito en otro curso con horario o fechas conflictivas.
    query = """
    SELECT c.horario, c.fecha_inicio, c.fecha_final FROM estudiantes_inscritos e
    JOIN cursos_disponibles c ON e.id_curso = c.id
    WHERE e.id_estudiante = %s AND e.id_curso != %s
    """
    cur.execute(query, (request.id_estudiante, request.id_curso))
    other_courses = cur.fetchall()
    for enrolled in other_courses:
        # Validación de horario (solapamiento en el mismo día)
        other_horario = enrolled.get("horario")
        if other_horario:
            other_day, other_start, other_end = parse_schedule(other_horario)
            if other_day and schedules_overlap(current_day, current_start, current_end, other_day, other_start, other_end):
                conn.close()
                return {"valid": False, "message": "El estudiante ya está inscrito en otro curso con horario conflictivo."}
        
        # Validación de fechas (solapamiento de intervalos de fechas)
        try:
            other_start_date = datetime.datetime.strptime(enrolled["fecha_inicio"], "%Y-%m-%d").date()
            other_end_date   = datetime.datetime.strptime(enrolled["fecha_final"], "%Y-%m-%d").date()
        except Exception:
            continue
        if current_start_date < other_end_date and other_start_date < current_end_date:
            conn.close()
            return {"valid": False, "message": "El estudiante ya está inscrito en otro curso con fechas conflictivas."}

    # 5. Validar cupos: contar inscripciones en el curso actual.
    cur.execute("SELECT COUNT(*) AS count FROM estudiantes_inscritos WHERE id_curso = %s", (request.id_curso,))
    result = cur.fetchone()
    current_count = result["count"]
    if current_count >= total_cupos:
        conn.close()
        return {"valid": False, "message": "Cupo máximo alcanzado para este curso."}

    # Calcular el nuevo cupo (incremental) para esta inscripción.
    new_cupo = current_count + 1

    # 6. Insertar la inscripción utilizando el nuevo cupo calculado.
    insert_sql = """
    INSERT INTO estudiantes_inscritos (id_curso, nombre_estudiante, id_estudiante, cupo)
    VALUES (%s, %s, %s, %s) RETURNING id;
    """
    try:
        cur.execute(insert_sql, (request.id_curso, request.nombre_estudiante, request.id_estudiante, new_cupo))
        new_id = cur.fetchone()["id"]
        conn.commit()
    except Exception as e:
        conn.rollback()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Error al registrar la inscripción: {str(e)}")
    
    conn.close()
    return {
        "valid": True,
        "message": "Inscripción registrada exitosamente.",
        "enrollment_id": new_id
    }
