# app/schemas.py
from pydantic import BaseModel

class EnrollmentRequest(BaseModel):
    id_curso: int
    nombre_estudiante: str
    id_estudiante: int
    cupos_totales: int
