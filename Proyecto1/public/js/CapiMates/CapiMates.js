window.iniciarCapiMates = function () {
    console.log("🚀 CapiMates Jugable iniciado");

    let juegoActivo = false;
    let rocaInterval, troncoInterval;
    let animacionId;
    let obstaculosArray = [];


    /* ------------- UI CAPIMATES izq ------------- */
    let vidas = 3;

    /* ------------- UI CAPIMATES der ------------- */
    let puntos = 0;
    let ultimoPuntoTiempo = 0;

    const msg = document.getElementById('mensaje');
    const startBtn = document.getElementById('start-btn');
    const juegoCapiMates = document.getElementById('juegoCapiMates');
    const personaje = document.getElementById('personaje');
    const enemigoContainer = document.getElementById('enemigos');
    // const corazones = document.getElementById("corazon");
    // const vidasPanel = document.getElementById("vidasPanel");

    startBtn.addEventListener('click', () => {
        console.log("Iniciar juego pulsado, cerrando Mensaje....");
        ocultarMensaje();
        iniciarCapiMates();
    });

    function mostrarMensaje(title, body) {
        msg.style.display = 'block';
        document.getElementById('msg-title').textContent = title;
        document.getElementById('msg-body').innerHTML = body;
        juegoActivo = false;

        detenerObstaculos();
        juegoCapiMates.classList.add("paused");
    }

    function ocultarMensaje() {
        msg.style.display = 'none';
        juegoActivo = true;

        juegoCapiMates.classList.remove("paused");
    }

    // Logica de obstaculos

    function generadorObstaculos() {
        if (!juegoActivo) return;

        rocaInterval = setInterval(() => {
            let roca = document.createElement("div");
            roca.classList.add("obstaculo");

            enemigoContainer.appendChild(roca);
            obstaculosArray.push(roca);

        }, 3000);

        troncoInterval = setInterval(() => {
            let tronco = document.createElement("div");
            tronco.classList.add("obstaculo1");

            enemigoContainer.appendChild(tronco);
            obstaculosArray.push(tronco);

        }, 8000);
    }

    function detenerObstaculos() {
        clearInterval(rocaInterval);
        clearInterval(troncoInterval);

        for (let obstaculo of obstaculosArray) {
            obstaculo.classList.add("paused");
        }
    }

    function detectarColisiones() {
        let pjRect = personaje.getBoundingClientRect();

        obstaculosArray.forEach((obs, i) => {
            let oRect = obs.getBoundingClientRect();

            if (!(pjRect.right < oRect.left ||
                pjRect.left > oRect.right ||
                pjRect.bottom < oRect.top ||
                pjRect.top > oRect.bottom)) {

                perderVida();

                obs.remove();
                obstaculosArray.splice(i, 1);
            }
        });
    }


    // Logica de vidas y puntos

    function perderVida() {

        const corazones = document.getElementById(`corazon${vidas}`);

        if (corazones) {
            corazones.remove();
        }

        vidas--;

        if (vidas <= 0) {
            juegoActivo = false;
            detenerObstaculos();
            mostrarMensaje("Juego Terminado", "Has perdido todas tus vidas. Pulsa JUGAR para reiniciar.");
        }
    }

    function hideQuiz() {
        document.getElementById("quizPopup").classList.add("hidden");
      }

    function ganarPuntos(cantidad = 1) {
        puntos += cantidad;
        document.getElementById("puntaje").textContent = puntos;
    }

    // function validarRespuesta() {
    //     if (respuestaCorrecta) {
    //         ganarPuntos(2);
    //     }
    // }

    //Iniciar el Juego, Ver para futuro implementar mas niveles

    function iniciarCapiMates() {
        juegoActivo = true;
        puntos = 0;
        vidas = 3;



        generadorObstaculos();
        loop();
    }


    // Cosas que se tienen que repetir en el juego

    function loop(timestamp) {
        if (!juegoActivo) {
            animacionId = null;
            return;
        }

        detectarColisiones();

        if (timestamp - ultimoPuntoTiempo > 1000) {
            ganarPuntos(1);
            ultimoPuntoTiempo = timestamp;
        }

        animacionId = requestAnimationFrame(loop);
    }

    /* Iniciar mostrando mensaje inicial */
    mostrarMensaje("¡Bienvenido a CapiMates!", "Consigue los maximos puntos resolviendo las operaciones matemáticas. Usa la barra spaciadora o 'W' para poder saltar. Presiona <strong>JUGAR</strong> para empezar.");

}

window.capiJugable = iniciarCapiMates;
