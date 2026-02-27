require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); 
const { MercadoPagoConfig, Preference } = require('mercadopago'); 

// Configuracion del cliente con token del .env
const clienteMercadoPago = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
});

const app = express();

// CONFIGURACIÓN DEL PUERTO PARA PRODUCCIÓN
const PORT = process.env.PORT || 3000;

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// Ruta para ver las habitaciones desde la base de datos real
app.get('/api/habitaciones', async (req, res) => {
    try {
        // Hacemos una consulta SQL real a Supabase
        const resultado = await pool.query('SELECT * FROM habitaciones');
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las habitaciones' });
    }
});

// Ruta para CREAR una nueva habitación (POST)
app.post('/api/habitaciones', async (req, res) => {
    try {
        // 1. Recibimos los datos que envía el cliente (Frontend)
        const { numero, tipo, precio_noche, estado_fisico } = req.body;

        // 2. Validación básica
        if (!numero || !tipo || !precio_noche) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        // 3. Consulta SQL Parametrizada (Seguridad anti SQL Injection)
        const query = `
            INSERT INTO habitaciones (numero, tipo, precio_noche, estado_fisico)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        
        // Si no envían estado_fisico, le ponemos 'Operativa' por defecto
        const values = [numero, tipo, precio_noche, estado_fisico || 'Operativa'];

        // 4. Ejecutamos la consulta
        const resultado = await pool.query(query, values);
        
        // 5. Respondemos con la habitación recién creada
        res.status(201).json({
            mensaje: 'Habitación creada con éxito',
            habitacion: resultado.rows[0]
        });

    } catch (error) {
        console.error(error);
        // Manejo de error específico: Habitación duplicada (Constraint UNIQUE)
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ese número de habitación ya existe' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta Maestra para CREAR una RESERVA (Con Candado Anti-Overbooking y Mercado Pago)
app.post('/api/reservas', async (req, res) => {
    try {
        const { 
            cliente_nombre, cliente_dni, cliente_email, cliente_telefono,
            id_habitacion, fecha_entrada, fecha_salida, total_pagar, origen 
        } = req.body;

        // --- VALIDACIÓN: EVITAR VIAJES EN EL TIEMPO ---
        const fechaEntradaObj = new Date(fecha_entrada);
        const fechaSalidaObj = new Date(fecha_salida);

        if (fechaEntradaObj >= fechaSalidaObj) {
            return res.status(400).json({ 
                error: 'Error: La fecha de salida debe ser posterior a la de entrada.' 
            });
        }

        // 0. EL CANDADO SQL (Validar disponibilidad)
        const checkDisponibilidad = await pool.query(`
            SELECT id_reserva FROM reservas 
            WHERE id_habitacion = $1 
            AND estado_reserva != 'Cancelada'
            AND fecha_entrada < $3 
            AND fecha_salida > $2
        `, [id_habitacion, fecha_entrada, fecha_salida]);

        if (checkDisponibilidad.rows.length > 0) {
            return res.status(409).json({ 
                error: '¡ERROR! La habitación ya está reservada en esas fechas.' 
            });
        }

        // 1. Buscar si el cliente ya existe por su DNI
        const checkCliente = await pool.query(
            'SELECT id_cliente FROM clientes WHERE dni_pasaporte = $1',
            [cliente_dni]
        );

        let id_cliente;

        if (checkCliente.rows.length > 0) {
            id_cliente = checkCliente.rows[0].id_cliente; // Ya existe
        } else {
            // Es nuevo, lo creamos
            const nuevoCliente = await pool.query(
                `INSERT INTO clientes (nombre_completo, dni_pasaporte, email, telefono)
                 VALUES ($1, $2, $3, $4) RETURNING id_cliente`,
                [cliente_nombre, cliente_dni, cliente_email, cliente_telefono]
            );
            id_cliente = nuevoCliente.rows[0].id_cliente;
        }

        // 2. Insertar la Reserva (Asegúrate de que por defecto se guarde como 'Pendiente' en tu BD)
        const nuevaReserva = await pool.query(
            `INSERT INTO reservas (id_cliente, id_habitacion, fecha_entrada, fecha_salida, total_pagar, origen, estado_reserva)
             VALUES ($1, $2, $3, $4, $5, $6, 'Pendiente') RETURNING *`,
            [id_cliente, id_habitacion, fecha_entrada, fecha_salida, total_pagar, origen || 'Web']
        );

        const id_reserva_creada = nuevaReserva.rows[0].id_reserva;

        // 3. Obtener el nombre de la habitación para el ticket de Mercado Pago
        const infoHab = await pool.query('SELECT numero, tipo FROM habitaciones WHERE id_habitacion = $1', [id_habitacion]);
        const nombreTicket = infoHab.rows.length > 0 
            ? `Reserva Hab. ${infoHab.rows[0].numero} - ${infoHab.rows[0].tipo}` 
            : 'Reserva Hotel Máncora';

        // 4. GENERAR EL LINK DE MERCADO PAGO
        // (Asume que "clienteMercadoPago" y "Preference" ya están importados arriba en tu server.js)
        const preference = new Preference(clienteMercadoPago);
        const respuestaMP = await preference.create({
            body: {
                items: [
                    {
                        title: nombreTicket,
                        quantity: 1,
                        unit_price: Number(total_pagar),
                        currency_id: "PEN"
                    }
                ],
                back_urls: {
                    success: "https://www.google.com",
                    failure: "https://www.google.com",
                    pending: "https://www.google.com"
                },
                auto_return: "approved",
                // ¡LA PIEZA CLAVE! Le adjuntamos el ID de la reserva al pago
                external_reference: id_reserva_creada.toString()
            }
        });

        // 5. Responder al frontend con los datos y el link azul
        res.status(201).json({
            mensaje: 'Reserva asegurada. Redirigiendo a la pasarela segura...',
            reserva: nuevaReserva.rows[0],
            link_pago: respuestaMP.init_point
        });

    } catch (error) {
        console.error("Error en la reserva o pago:", error);
        res.status(500).json({ error: 'Error interno del servidor al procesar la reserva' });
    }
});

// =========================================================
// RUTA PARA EL PANEL: LEER RESERVAS CON FILTRO DE FECHA (GET)
// =========================================================
app.get('/api/reservas', async (req, res) => {
    try {
        // Capturamos la fecha enviada por el frontend (si existe)
        const { fecha } = req.query;

        let query = `
            SELECT 
                r.id_reserva, 
                c.nombre_completo, 
                c.dni_pasaporte, 
                h.numero AS habitacion, 
                r.fecha_entrada, 
                r.fecha_salida, 
                r.total_pagar, 
                r.estado_reserva,
                r.origen
            FROM reservas r
            JOIN clientes c ON r.id_cliente = c.id_cliente
            JOIN habitaciones h ON r.id_habitacion = h.id_habitacion
        `;
        
        const valores = [];

        // Si mandan una fecha, filtramos las reservas que estén activas en ese día exacto
        if (fecha) {
            query += ` WHERE $1 >= r.fecha_entrada AND $1 <= r.fecha_salida `;
            valores.push(fecha);
        }

        query += ` ORDER BY r.fecha_entrada ASC;`;
        
        const resultado = await pool.query(query, valores);
        res.json(resultado.rows); 

    } catch (error) {
        console.error("Error al filtrar reservas:", error);
        res.status(500).json({ error: 'Error al obtener las reservas para el panel' });
    }
});

// =========================================================
// RUTA PARA ACTUALIZAR EL ESTADO DE UNA RESERVA (PUT)
// =========================================================
app.put('/api/reservas/:id/estado', async (req, res) => {
    try {
        const { id } = req.params; // Capturamos el ID de la URL
        const { estado_reserva } = req.body; // Capturamos el nuevo estado enviado

        // 1. Candado de seguridad: Solo permitimos estos 3 estados
        const estadosValidos = ['Pendiente', 'Confirmada', 'Cancelada'];
        if (!estadosValidos.includes(estado_reserva)) {
            return res.status(400).json({ error: 'Estado de reserva no válido' });
        }

        // 2. Consulta SQL para actualizar
        const query = `
            UPDATE reservas 
            SET estado_reserva = $1 
            WHERE id_reserva = $2 
            RETURNING *;
        `;
        
        const resultado = await pool.query(query, [estado_reserva, id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        res.json({ 
            mensaje: 'Estado actualizado correctamente', 
            reserva: resultado.rows[0] 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el estado de la reserva' });
    }
});

// =========================================================
// RUTA PARA KPIs: ESTADÍSTICAS DEL MES ACTUAL (GET)
// =========================================================
app.get('/api/estadisticas', async (req, res) => {
    try {
        // Usamos la función de agregación y el filtro por mes de PostgreSQL
        const query = `
            SELECT 
                COUNT(*) FILTER (WHERE estado_reserva = 'Confirmada') AS total_confirmadas,
                COALESCE(SUM(total_pagar) FILTER (WHERE estado_reserva = 'Confirmada'), 0) AS ingresos_totales,
                COUNT(*) FILTER (WHERE estado_reserva = 'Pendiente') AS total_pendientes
            FROM reservas
            WHERE EXTRACT(MONTH FROM fecha_entrada) = EXTRACT(MONTH FROM CURRENT_DATE)
              AND EXTRACT(YEAR FROM fecha_entrada) = EXTRACT(YEAR FROM CURRENT_DATE);
        `;
        
        const resultado = await pool.query(query);
        res.json(resultado.rows[0]); // Devolvemos la única fila con los 3 totales

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al calcular las estadísticas' });
    }
});

// =========================================================
// RUTA PARA GENERAR EL LINK DE PAGO (MERCADO PAGO)
// =========================================================
app.post('/api/pagos/crear-preferencia', async (req, res) => {
    try {
        const { titulo, precio_total, id_habitacion } = req.body;

        // 1. Instanciamos la Preferencia
        const preference = new Preference(clienteMercadoPago);

        // 2. Estructura estricta exigida por Mercado Pago
        const respuesta = await preference.create({
            body: {
                items: [
                    {
                        title: titulo,
                        quantity: 1,
                        unit_price: Number(precio_total),
                        currency_id: "PEN"
                    }
                ],
                // NOTA: back_urls debe ir obligatoriamente dentro de 'body'
                back_urls: {
                    success: "https://www.google.com",
                    failure: "https://www.google.com",
                    pending: "https://www.google.com"
                },
                auto_return: "approved"
            }
        });

        // 3. Devolvemos el link al Frontend
        res.json({ 
            id_preferencia: respuesta.id, 
            link_pago: respuesta.init_point // URL directa para cobrar
        });

    } catch (error) {
        // Mejoramos el console.log para ver errores internos de la API
        console.error("Error al crear preferencia en Mercado Pago:", error.message || error);
        res.status(500).json({ error: 'Error al generar el link de pago' });
    }
});

// =========================================================
// WEBHOOK: MERCADO PAGO AVISA QUE EL PAGO SE COMPLETÓ (POST)
// =========================================================
app.post('/api/webhook', async (req, res) => {
    // 1. MP exige que le respondamos "OK" inmediatamente
    res.status(200).send("OK");

    try {
        const tipoEvento = req.query.type || (req.body && req.body.type);
        const pagoId = req.query['data.id'] || (req.body.data && req.body.data.id);

        if (tipoEvento === 'payment' && pagoId) {
            
            // --- INICIO MODO SIMULACIÓN PARA THUNDER CLIENT ---
            if (pagoId === 'TEST_LOCAL') {
                const id_reserva_prueba = req.body.external_reference;
                
                console.log(`[SIMULACIÓN] Forzando confirmación de la reserva #${id_reserva_prueba}...`);
                
                await pool.query(
                    `UPDATE reservas SET estado_reserva = 'Confirmada' WHERE id_reserva = $1`, 
                    [id_reserva_prueba]
                );
                return console.log(`[SIMULACIÓN] ¡ÉXITO! Reserva #${id_reserva_prueba} confirmada en BD.`);
            }
            // --- FIN MODO SIMULACIÓN ---

            // Lógica real para producción (Hablando con Mercado Pago)
            console.log(`Recibido aviso de pago ID: ${pagoId}. Verificando...`);
            const respuestaPago = await fetch(`https://api.mercadopago.com/v1/payments/${pagoId}`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
            });
            const infoPago = await respuestaPago.json();

            if (infoPago.status === 'approved') {
                const id_reserva = infoPago.external_reference;
                await pool.query(
                    `UPDATE reservas SET estado_reserva = 'Confirmada' WHERE id_reserva = $1`, 
                    [id_reserva]
                );
                console.log(`¡ÉXITO REAL! Reserva #${id_reserva} pagada y confirmada.`);
            }
        }
    } catch (error) {
        console.error("Error procesando Webhook:", error.message);
    }
});

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`=========================================`);
});