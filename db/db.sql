/*---------CREAR BASE----------*/ 
create database if not exists momoAgenda;
use momoAgenda;
/*--------------TABLAS-------------*/
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255)
);
-- SELECT * FROM usuarios;

CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    nombre VARCHAR(100),
    profesor VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
-- ALTER TABLE materias ADD color VARCHAR(7);
-- SELECT * FROM materias;

CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT,
    dia ENUM('Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'),
    hora_inicio TIME,
    hora_fin TIME,
    FOREIGN KEY (materia_id) REFERENCES materias(id)
);
-- SELECT * FROM horarios;

CREATE TABLE tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    materia_id INT,
    titulo VARCHAR(150),
    descripcion TEXT,
    fecha_entrega DATE,
    estado ENUM('pendiente', 'completada') DEFAULT 'pendiente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (materia_id) REFERENCES materias(id)
);
-- SELECT * FROM tareas;

/*---------------DATOS DE PRUEBA-------------*/

INSERT INTO usuarios (nombre, email, password)
VALUES ('Momo', 'momo@test.com', '123456');

INSERT INTO materias (usuario_id, nombre, profesor) VALUES
(1, 'Matemáticas', 'Dr. García'),
(1, 'Programación Web', 'Ing. López'),
(1, 'Física', 'Dr. Ramírez');

INSERT INTO horarios (materia_id, dia, hora_inicio, hora_fin) VALUES
(1, 'Lunes', '07:00:00', '08:00:00'),
(1, 'Miercoles', '07:00:00', '08:00:00'),
(2, 'Martes', '08:00:00', '09:00:00'),
(2, 'Jueves', '08:00:00', '09:00:00'),
(3, 'Viernes', '09:00:00', '10:00:00');

INSERT INTO tareas (usuario_id, materia_id, titulo, descripcion, fecha_entrega, estado) VALUES
(1, 1, 'Tarea álgebra', 'Resolver ejercicios 1-10', '2026-04-15 23:59:00', 'pendiente'),
(1, 2, 'Proyecto web', 'Crear página con Node y HBS', '2026-04-18 20:00:00', 'pendiente'),
(1, 3, 'Reporte física', 'Investigar leyes de Newton', '2026-04-16 18:00:00', 'completada');

/*---------------PRUEBAS QUERY------------*/