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

window.addEventListener('DOMContentLoaded', cargarCatalogo);