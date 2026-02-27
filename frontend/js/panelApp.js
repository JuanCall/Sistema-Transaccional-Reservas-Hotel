// =========================================================
// FUNCIONES DE UTILIDAD
// =========================================================
function formatearFecha(fechaString) {
    const fecha = new Date(fechaString);
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function actualizarSubtitulo() {
    const el = document.getElementById('topbar-subtitle');
    if (!el) return;
    const inputFiltro = document.getElementById('filtro-fecha');
    const fechaVal = inputFiltro ? inputFiltro.value : '';
    if (fechaVal) {
        const fecha = new Date(fechaVal);
        fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
        const label = fecha.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        el.textContent = label.charAt(0).toUpperCase() + label.slice(1);
    } else {
        el.textContent = 'Todas las reservas';
    }
}

function limpiarFiltro() {
    const inputFiltro = document.getElementById('filtro-fecha');
    if (inputFiltro) inputFiltro.value = '';
    cargarReservas();
}


// =========================================================
// CAMBIAR ESTADO
// =========================================================
async function cambiarEstado(id_reserva, nuevoEstado) {
    if (!confirm(`¿Cambiar la reserva #${id_reserva} a "${nuevoEstado}"?`)) {
        cargarReservas();
        return;
    }
    try {
        const respuesta = await fetch(`https://sistema-transaccional-reservas-hotel.onrender.com/api/reservas/${id_reserva}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado_reserva: nuevoEstado })
        });
        if (respuesta.ok) {
            cargarEstadisticas();
            cargarReservas();
        } else {
            const error = await respuesta.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor.');
    }
}


// =========================================================
// CARGAR RESERVAS
// =========================================================
async function cargarReservas() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    const resultsCount = document.getElementById('results-count');

    cuerpoTabla.innerHTML = `<tr><td colspan="9" class="mensaje-vacio"><span class="loading-dots">Actualizando datos</span></td></tr>`;
    if (resultsCount) resultsCount.textContent = '';
    actualizarSubtitulo();

    try {
        const inputFiltro = document.getElementById('filtro-fecha');
        const fechaSeleccionada = inputFiltro ? inputFiltro.value : '';
        const url = fechaSeleccionada
            ? `https://sistema-transaccional-reservas-hotel.onrender.com/api/reservas?fecha=${fechaSeleccionada}`
            : `https://sistema-transaccional-reservas-hotel.onrender.com/api/reservas`;

        const respuesta = await fetch(url);
        const reservas = await respuesta.json();

        if (resultsCount) {
            resultsCount.textContent = `${reservas.length} registro${reservas.length !== 1 ? 's' : ''}`;
        }

        if (reservas.length === 0) {
            cuerpoTabla.innerHTML = `<tr><td colspan="9" class="mensaje-vacio">No hay reservas registradas para esta fecha.</td></tr>`;
            return;
        }

        cuerpoTabla.innerHTML = '';

        reservas.forEach((reserva, i) => {
            const fila = document.createElement('tr');
            fila.style.animationDelay = `${i * 40}ms`;

            fila.innerHTML = `
                <td><span class="cell-id">#${reserva.id_reserva}</span></td>
                <td>
                    <span class="client-name">${reserva.nombre_completo}</span>
                    <span class="client-dni">DNI: ${reserva.dni_pasaporte}</span>
                </td>
                <td><span class="room-tag">${reserva.habitacion}</span></td>
                <td><span class="date-cell">${formatearFecha(reserva.fecha_entrada)}</span></td>
                <td><span class="date-cell">${formatearFecha(reserva.fecha_salida)}</span></td>
                <td><span class="origin-tag">${reserva.origen}</span></td>
                <td><span class="cell-amount">S/ ${reserva.total_pagar}</span></td>
                <td><span class="badge estado-${reserva.estado_reserva}">${reserva.estado_reserva}</span></td>
                <td>
                    <select class="action-select" onchange="cambiarEstado(${reserva.id_reserva}, this.value)">
                        <option value="" disabled selected>Cambiar…</option>
                        <option value="Confirmada">✅ Confirmada</option>
                        <option value="Cancelada">❌ Cancelada</option>
                        <option value="Pendiente">⏳ Pendiente</option>
                    </select>
                </td>
            `;

            cuerpoTabla.appendChild(fila);
        });

    } catch (error) {
        console.error(error);
        cuerpoTabla.innerHTML = `<tr><td colspan="9" class="mensaje-vacio">Error al conectar con el servidor.</td></tr>`;
    }
}


// =========================================================
// CARGAR KPIs
// =========================================================
async function cargarEstadisticas() {
    try {
        const respuesta = await fetch('https://sistema-transaccional-reservas-hotel.onrender.com/api/estadisticas');
        const stats = await respuesta.json();

        document.getElementById('kpi-ingresos').textContent    = `S/ ${parseFloat(stats.ingresos_totales).toFixed(2)}`;
        document.getElementById('kpi-confirmadas').textContent  = stats.total_confirmadas;
        document.getElementById('kpi-pendientes').textContent   = stats.total_pendientes;
    } catch (error) {
        console.error('Error cargando KPIs:', error);
        document.getElementById('kpi-ingresos').textContent    = '—';
        document.getElementById('kpi-confirmadas').textContent  = '—';
        document.getElementById('kpi-pendientes').textContent   = '—';
    }
}


// =========================================================
// INICIALIZACIÓN
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
    const inputFiltro = document.getElementById('filtro-fecha');

    if (inputFiltro) {
        const fechaHoy = new Date();
        fechaHoy.setMinutes(fechaHoy.getMinutes() - fechaHoy.getTimezoneOffset());
        inputFiltro.value = fechaHoy.toISOString().split('T')[0];
        inputFiltro.addEventListener('change', cargarReservas);
    }

    cargarReservas();
    cargarEstadisticas();
});