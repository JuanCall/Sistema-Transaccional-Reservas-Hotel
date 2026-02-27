-- ==========================================
-- 1. LIMPIEZA TOTAL
-- ==========================================
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS habitaciones CASCADE;

-- ==========================================
-- 2. CREACIÓN DE TABLAS
-- ==========================================
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    dni_pasaporte VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20)
);

CREATE TABLE habitaciones (
    id_habitacion SERIAL PRIMARY KEY,
    numero VARCHAR(10) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    precio_noche DECIMAL(10, 2) NOT NULL,
    estado_fisico VARCHAR(20) DEFAULT 'Operativa',
    imagen_url TEXT,
    descripcion TEXT
);

CREATE TABLE reservas (
    id_reserva SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_habitacion INT NOT NULL,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    total_pagar DECIMAL(10, 2) NOT NULL,
    estado_reserva VARCHAR(20) DEFAULT 'Pendiente', 
    origen VARCHAR(20) DEFAULT 'Web',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    CONSTRAINT fk_habitacion FOREIGN KEY (id_habitacion) REFERENCES habitaciones(id_habitacion) ON DELETE RESTRICT
);

-- ==========================================
-- 3. POBLAR DATOS - 10 HABITACIONES
-- ==========================================
INSERT INTO habitaciones (numero, tipo, precio_noche, estado_fisico, imagen_url, descripcion) VALUES
('H001', 'Matrimonial', 150.00, 'Operativa', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80', 'Acogedora habitación con cama King size, aire acondicionado, terraza privada y baño. Ideal para parejas buscando descanso absoluto.'),
('H002', 'Doble', 180.00, 'Operativa', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80', 'Espaciosa habitación con dos camas individuales súper cómodas, amplio espacio para equipaje y decoración rústica playera.'),
('H003', 'Familiar', 250.00, 'Operativa', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80', 'Espacio de sobra para toda la familia. Incluye una cama matrimonial y un camarote (litera). Muy cerca de la piscina.'),
('H004', 'Matrimonial Vista Mar', 200.00, 'Operativa', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', 'Cama King size y balcón con vista al mar. Decoración moderna y baño con acabados de lujo.'),
('H005', 'Suite Premium', 350.00, 'Operativa', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80', 'La mejor suite del hotel con jacuzzi privado, cama extra grande y vista panorámica a la playa de Máncora.'),
('H006', 'Doble Económica', 120.00, 'Operativa', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80', 'Ideal para mochileros, cuenta con dos camas individuales, ventilador de techo y baño compartido.'),
('H007', 'Familiar Superior', 280.00, 'Operativa', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80', 'Dos ambientes conectados para mayor privacidad familiar. Cuenta con mini refrigeradora y dos televisores.'),
('H008', 'Matrimonial Estándar', 130.00, 'Operativa', 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800&q=80', 'Habitación en el primer piso con fácil acceso a la piscina y al restaurante.'),
('H009', 'Triple', 210.00, 'Operativa', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80', 'Tres camas individuales, clóset amplio y decoración tropical. Perfecta para grupos de amigos.'),
('H010', 'Suite Luna de Miel', 300.00, 'Operativa', 'https://images.unsplash.com/photo-1582719478250-c89400213f5f?w=800&q=80', 'Decoración romántica especial, botella de cava de cortesía y terraza privada para ver el atardecer.');

-- ==========================================
-- 4. POBLAR DATOS - 30 CLIENTES
-- ==========================================
INSERT INTO clientes (nombre_completo, dni_pasaporte, email, telefono) VALUES
('Carlos Mendoza', '95822412', 'carlos.mendoza@ejemplo.com', '924942603'),
('Maria Garcia', '13356886', 'maria.garcia@ejemplo.com', '946913810'),
('Juan Perez', '42868828', 'juan.perez@ejemplo.com', '939958838'),
('Ana Flores', '28728463', 'ana.flores@ejemplo.com', '923756669'),
('Luis Sanchez', '83197857', 'luis.sanchez@ejemplo.com', '921668732'),
('Carmen Ramirez', '89254563', 'carmen.ramirez@ejemplo.com', '966629388'),
('Jose Torres', '14265799', 'jose.torres@ejemplo.com', '913999315'),
('Rosa Lopez', '22575562', 'rosa.lopez@ejemplo.com', '939345092'),
('Jorge Gonzalez', '41227216', 'jorge.gonzalez@ejemplo.com', '977827638'),
('Laura Diaz', '90801586', 'laura.diaz@ejemplo.com', '913561597'),
('Pedro Vasquez', '85329037', 'pedro.vasquez@ejemplo.com', '936687537'),
('Marta Cruz', '97226012', 'marta.cruz@ejemplo.com', '983140807'),
('Miguel Reyes', '66306997', 'miguel.reyes@ejemplo.com', '939587039'),
('Lucia Gomez', '70291817', 'lucia.gomez@ejemplo.com', '989089901'),
('Diego Morales', '47338124', 'diego.morales@ejemplo.com', '910872248'),
('Paula Ortiz', '31429110', 'paula.ortiz@ejemplo.com', '966722344'),
('Andres Gutierrez', '55667651', 'andres.gutierrez@ejemplo.com', '947295260'),
('Elena Chavez', '30868105', 'elena.chavez@ejemplo.com', '938898923'),
('Fernando Ramos', '55176955', 'fernando.ramos@ejemplo.com', '923718431'),
('Sofia Herrera', '22448136', 'sofia.herrera@ejemplo.com', '960992979'),
('Ricardo Medina', '22981052', 'ricardo.medina@ejemplo.com', '958181396'),
('Isabel Aguilar', '56164955', 'isabel.aguilar@ejemplo.com', '991030736'),
('Daniel Castro', '45503389', 'daniel.castro@ejemplo.com', '915831819'),
('Patricia Romero', '71662963', 'patricia.romero@ejemplo.com', '981971316'),
('Alejandro Vargas', '26753883', 'alejandro.vargas@ejemplo.com', '960806024'),
('Teresa Guzman', '20576383', 'teresa.guzman@ejemplo.com', '984093639'),
('Javier Salazar', '49349722', 'javier.salazar@ejemplo.com', '994374605'),
('Monica Rojas', '93016315', 'monica.rojas@ejemplo.com', '958537831'),
('Victor Ruiz', '87490893', 'victor.ruiz@ejemplo.com', '935808537'),
('Claudia Mendez', '19335534', 'claudia.mendez@ejemplo.com', '916150444');

-- ==========================================
-- 5. POBLAR DATOS - 100 RESERVAS (2026)
-- ==========================================
INSERT INTO reservas (id_cliente, id_habitacion, fecha_entrada, fecha_salida, total_pagar, estado_reserva, origen) VALUES
(25, 4, '2026-05-03', '2026-05-05', 400.00, 'Confirmada', 'Web'),
(15, 5, '2026-11-27', '2026-11-30', 1050.00, 'Confirmada', 'Web'),
(7, 6, '2026-11-09', '2026-11-10', 120.00, 'Cancelada', 'Recepcion'),
(18, 3, '2026-12-08', '2026-12-10', 500.00, 'Pendiente', 'Web'),
(22, 4, '2026-06-27', '2026-06-28', 200.00, 'Confirmada', 'Web'),
(13, 6, '2026-05-03', '2026-05-05', 240.00, 'Cancelada', 'Recepcion'),
(7, 6, '2026-11-16', '2026-11-20', 480.00, 'Pendiente', 'Web'),
(5, 5, '2026-04-24', '2026-04-29', 1750.00, 'Cancelada', 'Web'),
(14, 10, '2026-10-13', '2026-10-16', 900.00, 'Confirmada', 'Web'),
(16, 9, '2026-02-25', '2026-02-26', 210.00, 'Confirmada', 'Web'),
(26, 3, '2026-11-14', '2026-11-19', 1250.00, 'Confirmada', 'Web'),
(20, 7, '2026-08-17', '2026-08-20', 840.00, 'Cancelada', 'Web'),
(22, 2, '2026-09-25', '2026-09-28', 540.00, 'Confirmada', 'Web'),
(14, 5, '2026-03-15', '2026-03-16', 350.00, 'Confirmada', 'Recepcion'),
(17, 3, '2026-02-28', '2026-03-03', 750.00, 'Cancelada', 'Recepcion'),
(5, 4, '2026-06-25', '2026-06-27', 400.00, 'Cancelada', 'Recepcion'),
(20, 1, '2026-06-16', '2026-06-17', 150.00, 'Confirmada', 'Web'),
(8, 5, '2026-01-08', '2026-01-13', 1750.00, 'Confirmada', 'Web'),
(27, 8, '2026-02-25', '2026-03-02', 650.00, 'Confirmada', 'Web'),
(18, 8, '2026-03-09', '2026-03-14', 650.00, 'Cancelada', 'Web'),
(30, 4, '2026-09-25', '2026-09-27', 400.00, 'Confirmada', 'Web'),
(15, 6, '2026-09-15', '2026-09-16', 120.00, 'Confirmada', 'Web'),
(11, 2, '2026-01-19', '2026-01-24', 900.00, 'Confirmada', 'Recepcion'),
(1, 4, '2026-02-23', '2026-02-24', 200.00, 'Confirmada', 'Web'),
(28, 1, '2026-06-03', '2026-06-08', 750.00, 'Confirmada', 'Web'),
(7, 8, '2026-09-05', '2026-09-10', 650.00, 'Cancelada', 'Web'),
(26, 4, '2026-08-26', '2026-08-30', 800.00, 'Confirmada', 'Web'),
(22, 2, '2026-07-12', '2026-07-16', 720.00, 'Pendiente', 'Web'),
(22, 1, '2026-11-21', '2026-11-22', 150.00, 'Confirmada', 'Web'),
(26, 6, '2026-02-08', '2026-02-10', 240.00, 'Confirmada', 'Recepcion'),
(5, 8, '2026-07-06', '2026-07-09', 390.00, 'Pendiente', 'Web'),
(15, 2, '2026-09-04', '2026-09-05', 180.00, 'Cancelada', 'Web'),
(30, 2, '2026-04-06', '2026-04-10', 720.00, 'Pendiente', 'Web'),
(28, 4, '2026-07-02', '2026-07-04', 400.00, 'Pendiente', 'Web'),
(9, 7, '2026-08-10', '2026-08-14', 1120.00, 'Cancelada', 'Recepcion'),
(5, 8, '2026-04-10', '2026-04-12', 260.00, 'Confirmada', 'Recepcion'),
(2, 9, '2026-12-11', '2026-12-12', 210.00, 'Confirmada', 'Recepcion'),
(3, 9, '2026-03-03', '2026-03-08', 1050.00, 'Confirmada', 'Recepcion'),
(13, 4, '2026-02-19', '2026-02-21', 400.00, 'Cancelada', 'Recepcion'),
(20, 1, '2026-02-14', '2026-02-19', 750.00, 'Cancelada', 'Recepcion'),
(30, 6, '2026-05-07', '2026-05-10', 360.00, 'Confirmada', 'Web'),
(5, 7, '2026-11-21', '2026-11-24', 840.00, 'Pendiente', 'Web'),
(1, 2, '2026-08-20', '2026-08-25', 900.00, 'Confirmada', 'Web'),
(7, 9, '2026-09-09', '2026-09-11', 420.00, 'Confirmada', 'Web'),
(12, 4, '2026-05-06', '2026-05-10', 800.00, 'Cancelada', 'Recepcion'),
(20, 5, '2026-11-17', '2026-11-18', 350.00, 'Cancelada', 'Web'),
(29, 2, '2026-03-09', '2026-03-10', 180.00, 'Confirmada', 'Recepcion'),
(5, 9, '2026-05-10', '2026-05-15', 1050.00, 'Confirmada', 'Recepcion'),
(7, 6, '2026-11-21', '2026-11-24', 360.00, 'Cancelada', 'Web'),
(29, 5, '2026-01-03', '2026-01-07', 1400.00, 'Confirmada', 'Web'),
(11, 1, '2026-03-21', '2026-03-24', 450.00, 'Confirmada', 'Recepcion'),
(18, 8, '2026-12-14', '2026-12-19', 650.00, 'Confirmada', 'Web'),
(29, 2, '2026-12-05', '2026-12-10', 900.00, 'Confirmada', 'Web'),
(18, 10, '2026-03-14', '2026-03-16', 600.00, 'Confirmada', 'Web'),
(29, 6, '2026-01-12', '2026-01-14', 240.00, 'Confirmada', 'Recepcion'),
(12, 2, '2026-09-28', '2026-10-02', 720.00, 'Cancelada', 'Recepcion'),
(30, 3, '2026-04-28', '2026-04-30', 500.00, 'Confirmada', 'Web'),
(6, 1, '2026-12-11', '2026-12-15', 600.00, 'Confirmada', 'Web'),
(26, 3, '2026-12-04', '2026-12-08', 1000.00, 'Confirmada', 'Web'),
(7, 4, '2026-08-12', '2026-08-15', 600.00, 'Confirmada', 'Web'),
(22, 1, '2026-04-13', '2026-04-16', 450.00, 'Confirmada', 'Web'),
(11, 9, '2026-01-04', '2026-01-07', 630.00, 'Confirmada', 'Recepcion'),
(2, 5, '2026-02-20', '2026-02-24', 1400.00, 'Confirmada', 'Recepcion'),
(14, 6, '2026-10-17', '2026-10-18', 120.00, 'Pendiente', 'Recepcion'),
(9, 4, '2026-01-23', '2026-01-27', 800.00, 'Confirmada', 'Recepcion'),
(22, 9, '2026-12-24', '2026-12-26', 420.00, 'Confirmada', 'Web'),
(22, 2, '2026-06-20', '2026-06-23', 540.00, 'Confirmada', 'Recepcion'),
(17, 5, '2026-05-22', '2026-05-26', 1400.00, 'Confirmada', 'Web'),
(18, 5, '2026-03-07', '2026-03-11', 1400.00, 'Pendiente', 'Recepcion'),
(20, 3, '2026-10-10', '2026-10-14', 1000.00, 'Cancelada', 'Web'),
(10, 5, '2026-04-14', '2026-04-19', 1750.00, 'Cancelada', 'Recepcion'),
(15, 6, '2026-08-15', '2026-08-17', 240.00, 'Cancelada', 'Web'),
(22, 3, '2026-02-10', '2026-02-15', 1250.00, 'Cancelada', 'Web'),
(27, 2, '2026-04-22', '2026-04-25', 540.00, 'Confirmada', 'Web'),
(1, 3, '2026-01-08', '2026-01-12', 1000.00, 'Cancelada', 'Web'),
(14, 8, '2026-11-19', '2026-11-21', 260.00, 'Pendiente', 'Web'),
(8, 7, '2026-03-21', '2026-03-22', 280.00, 'Confirmada', 'Web'),
(6, 4, '2026-12-17', '2026-12-21', 800.00, 'Confirmada', 'Recepcion'),
(30, 4, '2026-02-15', '2026-02-17', 400.00, 'Pendiente', 'Recepcion'),
(18, 9, '2026-10-11', '2026-10-15', 840.00, 'Cancelada', 'Recepcion'),
(14, 9, '2026-09-15', '2026-09-17', 420.00, 'Pendiente', 'Web'),
(16, 9, '2026-11-08', '2026-11-11', 630.00, 'Pendiente', 'Web'),
(8, 5, '2026-05-11', '2026-05-14', 1050.00, 'Cancelada', 'Web'),
(5, 3, '2026-04-13', '2026-04-15', 500.00, 'Confirmada', 'Web'),
(14, 7, '2026-06-18', '2026-06-22', 1120.00, 'Pendiente', 'Web'),
(27, 4, '2026-07-13', '2026-07-18', 1000.00, 'Confirmada', 'Recepcion'),
(16, 7, '2026-01-12', '2026-01-15', 840.00, 'Pendiente', 'Web'),
(24, 9, '2026-12-18', '2026-12-23', 1050.00, 'Confirmada', 'Web'),
(27, 3, '2026-08-05', '2026-08-10', 1250.00, 'Cancelada', 'Web'),
(19, 7, '2026-10-22', '2026-10-23', 280.00, 'Confirmada', 'Recepcion'),
(5, 7, '2026-08-06', '2026-08-07', 280.00, 'Confirmada', 'Web'),
(7, 6, '2026-08-11', '2026-08-14', 360.00, 'Pendiente', 'Web'),
(9, 7, '2026-02-16', '2026-02-17', 280.00, 'Cancelada', 'Web'),
(8, 6, '2026-11-03', '2026-11-04', 120.00, 'Confirmada', 'Web'),
(27, 4, '2026-01-20', '2026-01-22', 400.00, 'Confirmada', 'Web'),
(22, 8, '2026-02-19', '2026-02-21', 260.00, 'Pendiente', 'Recepcion'),
(25, 5, '2026-06-06', '2026-06-11', 1750.00, 'Cancelada', 'Recepcion'),
(25, 2, '2026-03-10', '2026-03-11', 180.00, 'Cancelada', 'Web'),
(19, 5, '2026-11-13', '2026-11-17', 1400.00, 'Confirmada', 'Web'),
(23, 10, '2026-11-08', '2026-11-09', 300.00, 'Confirmada', 'Recepcion');