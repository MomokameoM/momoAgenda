/*---------CREAR BASE----------*/ 

drop database if exists momoAgenda;
create database if not exists momoAgenda;
use momoAgenda;

/*-----------------------------TABLAS-----------------------*/
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    rol ENUM('user', 'admin') DEFAULT 'user'    
);
-- SELECT * FROM usuarios;

CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    nombre VARCHAR(100),
    profesor VARCHAR(100),
    color VARCHAR(7) DEFAULT '#FF5733',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    UNIQUE (usuario_id, nombre)
);
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

INSERT INTO usuarios (nombre, email, password,rol)
VALUES ('Momo', 'momo@test.com', '$2b$10$r7xYGFmFKtHxdpiPAeFPi.8a2tx2mF61g6UMjZcEwfZK7P/3LSvI.', 'user');

INSERT INTO usuarios (nombre, email, password,rol)
VALUES ('admin', 'admin@test.com', '$2b$10$r7xYGFmFKtHxdpiPAeFPi.8a2tx2mF61g6UMjZcEwfZK7P/3LSvI.', 'admin');

INSERT INTO materias (usuario_id, nombre, profesor) VALUES
(1, 'Matemáticas', 'Dr. García'),
(1, 'Programación Web', 'Ing. López'),
(1, 'Física', 'Dr. Ramírez');

INSERT INTO horarios (materia_id, dia, hora_inicio, hora_fin) VALUES
(2, 'Lunes', '07:00:00', '08:00:00'),
(2, 'Miercoles', '07:00:00', '08:00:00'),
(3, 'Martes', '08:00:00', '09:00:00'),
(3, 'Jueves', '08:00:00', '09:00:00'),
(4, 'Viernes', '09:00:00', '10:00:00');

INSERT INTO tareas (usuario_id, materia_id, titulo, descripcion, fecha_entrega, estado) VALUES
(1, 2, 'Tarea álgebra', 'Resolver ejercicios 1-10', '2026-04-15 23:59:00', 'pendiente'),
(1, 3, 'Proyecto web', 'Crear página con Node y HBS', '2026-04-18 20:00:00', 'pendiente'),
(1, 4, 'Reporte física', 'Investigar leyes de Newton', '2026-04-16 18:00:00', 'completada');

/*---------------PRUEBAS QUERY------------*/