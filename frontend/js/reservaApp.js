// DICCIONARIO DE DATOS EXTRA
const detallesExtraHabitaciones = {
    "Matrimonial": {
        descripcion: "Perfecta para parejas. Disfruta de una cama King size, terraza privada y un ambiente romántico diseñado para el descanso absoluto.",
        fotos: [
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800", 
            "https://images.unsplash.com/photo-1582719478250-c89400213f5f?w=800", 
            "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=800"  
        ]
    },
    "Doble": {
        descripcion: "Ideal para amigos o compañeros de viaje. Cuenta con dos camas individuales súper cómodas y amplio espacio para equipaje.",
        fotos: [
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800", 
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"
        ]
    },
    "Familiar": {
        descripcion: "Espacio de sobra para toda la familia. Incluye una cama matrimonial y un camarote (litera).",
        fotos: [
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
            "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800"
        ]
    }
};

// VARIABLES GLOBALES
let precioNocheGlobal = 0;
let montoTotalCalculado = 0;

window.addEventListener('DOMContentLoaded', () => {
    // 1. LEER LOS DATOS DE LA URL
    const urlParams = new URLSearchParams(window.location.search);
    const idHabitacion = urlParams.get('id');
    const tipoHabitacion = urlParams.get('tipo');
    const precioHabitacion = urlParams.get('precio');

    // Si alguien entra a reserva.html sin seleccionar habitación, lo devolvemos al inicio
    if (!idHabitacion || !tipoHabitacion || !precioHabitacion) {
        window.location.href = 'index.html';
        return;
    }

    // 2. CONFIGURAR LA PANTALLA
    document.getElementById('habitacion-id').value = idHabitacion;
    precioNocheGlobal = parseFloat(precioHabitacion);
    
    document.getElementById('detalle-titulo-hab').innerText = `Habitación ${tipoHabitacion} (S/ ${precioNocheGlobal}/noche)`;
    
    const infoExtra = detallesExtraHabitaciones[tipoHabitacion] || detallesExtraHabitaciones["Matrimonial"];
    document.getElementById('detalle-descripcion-hab').innerText = infoExtra.descripcion;
    
    // Configurar Fotos
    const fotoPrincipal = document.getElementById('foto-principal');
    const contenedorMiniaturas = document.getElementById('contenedor-miniaturas');
    
    fotoPrincipal.src = infoExtra.fotos[0];
    infoExtra.fotos.forEach((url, index) => {
        const img = document.createElement('img');
        img.src = url;
        if(index === 0) img.className = 'activa';
        
        img.onclick = () => {
            fotoPrincipal.src = url;
            document.querySelectorAll('.miniaturas img').forEach(m => m.classList.remove('activa'));
            img.classList.add('activa');
        };
        contenedorMiniaturas.appendChild(img);
    });

    // 3. CONFIGURAR FECHAS
    const inputEntrada = document.getElementById('entrada');
    const inputSalida = document.getElementById('salida');
    const hoy = new Date().toISOString().split('T')[0];
    
    inputEntrada.setAttribute('min', hoy);

    inputEntrada.addEventListener('change', function() {
        let fechaIngreso = new Date(this.value);
        fechaIngreso.setDate(fechaIngreso.getDate() + 1);
        let diaSiguiente = fechaIngreso.toISOString().split('T')[0];
        inputSalida.setAttribute('min', diaSiguiente);
        if (inputSalida.value && inputSalida.value <= this.value) { inputSalida.value = ''; }
        calcularPrecioTotal();
    });

    inputSalida.addEventListener('change', calcularPrecioTotal);
});

// 4. CALCULADORA DE PRECIO
function calcularPrecioTotal() {
    const inputEntrada = document.getElementById('entrada');
    const inputSalida = document.getElementById('salida');
    const resumenTotal = document.getElementById('resumen-total');
    
    const fechaIn = new Date(inputEntrada.value);
    const fechaOut = new Date(inputSalida.value);

    if (inputEntrada.value && inputSalida.value && fechaOut > fechaIn) {
        const dias = (fechaOut.getTime() - fechaIn.getTime()) / (1000 * 3600 * 24);
        montoTotalCalculado = dias * precioNocheGlobal;
        resumenTotal.innerText = `Total a pagar: S/ ${montoTotalCalculado.toFixed(2)}`;
    } else {
        montoTotalCalculado = 0;
        resumenTotal.innerText = `Total a pagar: S/ 0.00`;
    }
}

// 5. ENVÍO DE DATOS A MERCADO PAGO
document.getElementById('formulario-reserva').addEventListener('submit', async function(evento) {
    evento.preventDefault();
    const btn = document.getElementById('btn-reservar');
    const alerta = document.getElementById('mensaje-alerta');
    
    btn.innerText = "Procesando..."; btn.disabled = true;

    const datosReserva = {
        cliente_nombre: document.getElementById('nombre').value,
        cliente_dni: document.getElementById('dni').value,
        cliente_email: document.getElementById('email').value,
        cliente_telefono: document.getElementById('telefono').value,
        id_habitacion: document.getElementById('habitacion-id').value,
        fecha_entrada: document.getElementById('entrada').value,
        fecha_salida: document.getElementById('salida').value,
        total_pagar: montoTotalCalculado,
        origen: "Web"
    };

    try {
        const respuesta = await fetch('http://localhost:3000/api/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosReserva)
        });

        const resultado = await respuesta.json();
        alerta.style.display = 'block';
        
        if (respuesta.ok) {
            alerta.className = 'exito';
            alerta.innerText = resultado.mensaje || "¡Redirigiendo a Mercado Pago...";
            setTimeout(() => { window.location.href = resultado.link_pago; }, 1500);
        } else {
            alerta.className = 'error';
            alerta.innerText = resultado.error;
            btn.innerText = "Confirmar y Pagar en Mercado Pago"; 
            btn.disabled = false;
        }
    } catch (error) {
        alerta.style.display = 'block'; 
        alerta.className = 'error'; 
        alerta.innerText = "Error de conexión con el servidor.";
        btn.innerText = "Confirmar y Pagar en Mercado Pago"; 
        btn.disabled = false;
    }
});