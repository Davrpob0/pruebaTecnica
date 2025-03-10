from pydantic import BaseModel

class EnrollmentRequest(BaseModel):
    id_clase: str
    id_curso: str
    nombre_estudiante: str
    id_estudiante: int
    cupos_totales: int
