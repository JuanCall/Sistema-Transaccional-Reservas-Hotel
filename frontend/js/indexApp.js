// CARGAR CATÁLOGO EN LA PÁGINA PRINCIPAL
async function cargarCatalogo() {
    try {
        const respuesta = await fetch('https://sistema-transaccional-reservas-hotel.onrender.com/api/habitaciones');
        const habitaciones = await respuesta.json();
        const grid = document.getElementById('grid-habitaciones');

        grid.innerHTML = '';

        habitaciones.forEach(hab => {
            if (hab.estado_fisico === 'Operativa') {
                const tarjeta = document.createElement('div');
                tarjeta.className = 'card-habitacion';

                const imagen = hab.imagen_url || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80';
                const descripcion = hab.descripcion || 'Hermosa habitación equipada para tu confort frente al mar.';

                tarjeta.innerHTML = `
                    <div class="card-img-wrap">
                        <img src="${imagen}" alt="${hab.tipo}" class="card-img">
                        <span class="card-badge">Disponible</span>
                    </div>
                    <div class="card-body">
                        <h3 class="card-title">${hab.tipo}</h3>
                        <p class="card-desc">${descripcion}</p>
                        <div class="card-price">
                            <sup>S/</sup>${parseFloat(hab.precio_noche).toFixed(0)}
                            <small>/ noche</small>
                        </div>
                        <button class="btn-seleccionar"
                            onclick="window.location.href='reserva.html?id=${hab.id_habitacion}&tipo=${encodeURIComponent(hab.tipo)}&precio=${hab.precio_noche}'">
                            Seleccionar Habitación
                        </button>
                    </div>
                `;
                grid.appendChild(tarjeta);
            }
        });

        // Trigger scroll-reveal on new cards
        if (typeof window.observeCards === 'function') {
            window.observeCards();
        }

    } catch (error) {
        console.error('Error cargando catálogo:', error);
        document.getElementById('grid-habitaciones').innerHTML =
            '<p style="color:#dc3545; text-align:center; width:100%;">Error al conectar con el servidor.</p>';
    }
}

// =========================================================
// MOTOR DE BÚSQUEDA DE DISPONIBILIDAD
// =========================================================
async function buscarHabitacionesLibres() {
    const checkin = document.getElementById('buscar-checkin').value;
    const checkout = document.getElementById('buscar-checkout').value;
    
    // CORRECCIÓN 1: Usamos el ID correcto que tienes en tu index.html
    const catalogo = document.getElementById('grid-habitaciones'); 

    if (!checkin || !checkout) {
        alert("Por favor, selecciona las fechas de Check-in y Check-out.");
        return;
    }

    if (new Date(checkin) >= new Date(checkout)) {
        alert("La fecha de salida debe ser posterior a la de entrada.");
        return;
    }

    // Ponemos la pantalla en modo carga
    catalogo.innerHTML = `<p style="text-align:center; padding: 40px; color: var(--text-muted); width: 100%;">Buscando las mejores opciones para ti... 🌊</p>`;

    try {
        const respuesta = await fetch(`https://sistema-transaccional-reservas-hotel.onrender.com/api/habitaciones/disponibles?checkin=${checkin}&checkout=${checkout}`);
        const habitaciones = await respuesta.json();

        catalogo.innerHTML = '';

        if (habitaciones.length === 0) {
            catalogo.innerHTML = `<p style="text-align:center; padding: 40px; color: var(--sunset); width: 100%; font-weight: bold;">Lo sentimos, no hay habitaciones disponibles para estas fechas. 😔<br>Intenta con otras fechas.</p>`;
            return;
        }

        // Dibujamos las tarjetas usando tu mismo diseño (HTML/CSS) del catálogo original
        habitaciones.forEach(hab => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'card-habitacion visible'; // Agregamos 'visible' para que no dependa del scroll

            const imagen = hab.imagen_url || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80';
            const descripcion = hab.descripcion || 'Hermosa habitación equipada para tu confort frente al mar.';

            tarjeta.innerHTML = `
                <div class="card-img-wrap">
                    <img src="${imagen}" alt="${hab.tipo}" class="card-img">
                    <span class="card-badge">Disponible</span>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${hab.tipo}</h3>
                    <p class="card-desc">${descripcion}</p>
                    <div class="card-price">
                        <sup>S/</sup>${parseFloat(hab.precio_noche).toFixed(0)}
                        <small>/ noche</small>
                    </div>
                    <button class="btn-seleccionar" 
                        onclick="irAReserva(${hab.id_habitacion}, '${hab.tipo}', ${hab.precio_noche}, '${checkin}', '${checkout}')">
                        Reservar Ahora
                    </button>
                </div>
            `;
            catalogo.appendChild(tarjeta);
        });

    } catch (error) {
        console.error('Error:', error);
        catalogo.innerHTML = `<p style="color:#dc3545; text-align:center; padding:20px; width: 100%;">Error al conectar con el servidor.</p>`;
    }
}

// =========================================================
// CORRECCIÓN 2: Función actualizada para llevar todos los datos
// =========================================================
function irAReserva(idHabitacion, tipo, precio, checkin, checkout) {
    // Armamos la URL con todos los datos (ID, Tipo, Precio, y las nuevas fechas)
    window.location.href = `reserva.html?id=${idHabitacion}&tipo=${encodeURIComponent(tipo)}&precio=${precio}&checkin=${checkin}&checkout=${checkout}`;
}

// =========================================================
// INICIALIZACIÓN Y VALIDACIÓN DE CALENDARIOS
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar el catálogo normal
    cargarCatalogo();

    // 2. Lógica de bloqueo de fechas en el buscador
    const inputCheckin = document.getElementById('buscar-checkin');
    const inputCheckout = document.getElementById('buscar-checkout');

    if (inputCheckin && inputCheckout) {
        // Obtenemos la fecha de hoy ajustada a la zona horaria local
        const hoy = new Date();
        hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
        const hoyStr = hoy.toISOString().split('T')[0];
        
        // Bloqueamos fechas pasadas en el Check-in
        inputCheckin.setAttribute('min', hoyStr);

        // Cada vez que el turista elige un Check-in, ajustamos el Check-out
        inputCheckin.addEventListener('change', () => {
            if (inputCheckin.value) {
                const fechaIn = new Date(inputCheckin.value);
                // El check-out debe ser MÍNIMO al día siguiente
                fechaIn.setDate(fechaIn.getDate() + 1);
                const minCheckoutStr = fechaIn.toISOString().split('T')[0];
                
                inputCheckout.setAttribute('min', minCheckoutStr);

                // Si el turista ya había puesto un check-out inválido, se lo corregimos automáticamente
                if (inputCheckout.value && inputCheckout.value < minCheckoutStr) {
                    inputCheckout.value = minCheckoutStr;
                }
            }
        });
    }
});