-- Tabla de usuarios alineada con TypeORM
CREATE TABLE IF NOT EXISTS usuario (
    usuario_id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contrasena TEXT NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'student',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de cursos disponibles (ID de 5 caracteres alfanuméricos)
CREATE TABLE IF NOT EXISTS cursos_disponibles (
    id VARCHAR(5) PRIMARY KEY,           
    nombre VARCHAR(100) NOT NULL
);

-- Tabla de clases disponibles
-- Cada curso tendrá una única clase asociada y se usará el mismo id de curso como clave primaria
CREATE TABLE IF NOT EXISTS clases_disponibles (
    id_curso VARCHAR(5) NOT NULL,
    id_clase VARCHAR(5) PRIMARY KEY NOT NULL,
    profesor VARCHAR(100) NOT NULL,
    cupos INTEGER NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_final DATE NOT NULL,
    horario VARCHAR(50) NOT NULL,
    CONSTRAINT fk_clase_curso
        FOREIGN KEY (id_curso) 
        REFERENCES cursos_disponibles(id) 
        ON DELETE CASCADE
);

-- Tabla de estudiantes inscritos
-- Se utiliza una clave compuesta para evitar duplicados en la inscripción del mismo estudiante a un curso
CREATE TABLE IF NOT EXISTS estudiantes_inscritos (
    id_clase VARCHAR(5) NOT NULL,
    nombre_estudiante VARCHAR(100) NOT NULL,
    id_estudiante BIGINT NOT NULL,
    cupo BIGINT NOT NULL,
    inscrito_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_estudiante_curso
        FOREIGN KEY (id_clase)
        REFERENCES clases_disponibles(id_clase)
        ON DELETE CASCADE
);
