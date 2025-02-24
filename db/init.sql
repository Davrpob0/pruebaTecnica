-- Tabla de usuarios alineada con TypeORM
CREATE TABLE IF NOT EXISTS usuario (
    usuario_id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'user',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cursos disponibles
CREATE TABLE IF NOT EXISTS cursos_disponibles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cupos INTEGER NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    fecha_inicio DATE NOT NULL,
    fecha_final DATE NOT NULL,
    horario VARCHAR(50) NOT NULL
);

-- Tabla de estudiantes inscritos
CREATE TABLE IF NOT EXISTS estudiantes_inscritos (
    id SERIAL PRIMARY KEY,
    id_curso INTEGER NOT NULL REFERENCES cursos_disponibles(id) ON DELETE CASCADE,
    nombre_estudiante VARCHAR(100) NOT NULL,
    id_estudiante INTEGER NOT NULL,
    cupo INTEGER NOT NULL,
    inscrito_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
