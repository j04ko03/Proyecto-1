window.iniciarCapiMates = function () {
    console.log("🚀 CapiMates Jugable iniciado");

    const msg = document.getElementById('mensaje');
    const startBtn = document.getElementById('start-btn');

    startBtn.addEventListener('click', () => {
        console.log("Iniciar juego pulsado, cerrando Mensaje....");
        ocultarMensaje();
        iniciarAstro();
    });

    function mostrarMensaje(title, body) {
        msg.style.display = 'block';
        document.getElementById('msg-title').textContent = title;
        document.getElementById('msg-body').innerHTML = body;
        gameActive = false;
    }

    function ocultarMensaje() {
        msg.style.display = 'none';
        gameActive = true;
    }

    /* Iniciar mostrando mensaje inicial */
    mostrarMensaje("¡Bienvenido a CapiMates!", "Consigue los maximos puntos resolviendo las operaciones matemáticas. Usa la barra spaciadora o 'W' para poder saltar. Presiona <strong>JUGAR</strong> para empezar.");

}

window.capiJugable = iniciarCapiMates;