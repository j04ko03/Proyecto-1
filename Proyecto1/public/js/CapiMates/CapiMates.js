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
    let puntosJugador = 0;

    const msg = document.getElementById('mensaje');
    const startBtn = document.getElementById('start-btn');
    const juegoCapiMates = document.getElementById('juegoCapiMates');
    const personaje = document.getElementById('personaje');
    const enemigoContainer = document.getElementById('enemigos');
    const bloque1 = [
        {
            pregunta: "¿Cuánto es 3 + 2?",
            respuesta: "5"
        },
        {
            pregunta: "¿Cuánto es 7 - 4?",
            respuesta: "3"
        },
        {
            pregunta: "Si tienes 5 manzanas y te regalan 3 más, ¿cuántas tienes?",
            respuesta: "8"
        },
        {
            pregunta: "¿Cuál número es mayor: 9 o 6?",
            respuesta: "9"
        },
        {
            pregunta: "¿Cuánto es 10 - 1?",
            respuesta: "9"
        }
    ];
    const bloque2 = [
        {
            pregunta: "¿Cuánto es 15 + 7?",
            respuesta: "22"
        },
        {
            pregunta: "¿Cuánto es 28 - 9?",
            respuesta: "19"
        },
        {
            pregunta: "Cuenta de 5 en 5 hasta llegar a 30. ¿Qué números dices?",
            respuesta: "5, 10, 15, 20, 25, 30"
        },
        {
            pregunta: "Si tienes 23 caramelos y comes 8, ¿cuántos te quedan?",
            respuesta: "15"
        },
        {
            pregunta: "¿Qué número viene después del 47?",
            respuesta: "48"
        }
    ];
    const bloque3 = [
        {
            pregunta: "¿Cuánto es 3 x 4?",
            respuesta: "12"
        },
        {
            pregunta: "Si un paquete trae 6 lápices y compras 3 paquetes, ¿cuántos lápices tienes?",
            respuesta: "18"
        },
        {
            pregunta: "¿Cuánto es 25 + 19?",
            respuesta: "44"
        },
        {
            pregunta: "Si un perro come 2 croquetas cada hora, ¿cuántas come en 5 horas?",
            respuesta: "10"
        },
        {
            pregunta: "¿Cuánto es 40 - 17?",
            respuesta: "23"
        }
    ];
    const bloque4 = [
        {
            pregunta: "¿Cuánto es 7 x 6?",
            respuesta: "42"
        },
        {
            pregunta: "¿Cuánto es 56 ÷ 7?",
            respuesta: "8"
        },
        {
            pregunta: "Si tienes 48 caramelos y quieres repartirlos entre 6 amigos por igual, ¿cuántos recibe cada uno?",
            respuesta: "8"
        },
        {
            pregunta: "¿Cuánto es 125 - 68?",
            respuesta: "57"
        },
        {
            pregunta: "Si una caja tiene 9 filas de 5 pelotas cada una, ¿cuántas pelotas hay en total?",
            respuesta: "45"
        }
    ];



    startBtn.addEventListener('click', () => {
        console.log("Iniciar juego pulsado, cerrando Mensaje....");
        ocultarMensaje();
        iniciarCapiMates();
    });

    // Mensajes de juego

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

    // Logica de colisiones

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

    function dibujarVidas() {

        vidasPanel.innerHTML = `
        <img id="corazon1" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" class="vida-img">
        <img id="corazon2" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" class="vida-img">
        <img id="corazon3" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" class="vida-img">
    `;

    }


    // Preguntas

    function obtenerPreguntaAleatoria(bloque) {
        return bloque[Math.floor(Math.random() * bloque.length)];
    }

    function obtenerPreguntaPorPuntos(puntos) {
        if (puntos < 15) {
            const p = obtenerPreguntaAleatoria(bloque1);
            return { ...p, bloque: 1 };
        } else if (puntos < 25) {
            const p = obtenerPreguntaAleatoria(bloque2);
            return { ...p, bloque: 2 };
        } else if (puntos < 35) {
            const p = obtenerPreguntaAleatoria(bloque3);
            return { ...p, bloque: 3 };
        } else {
            const p = obtenerPreguntaAleatoria(bloque4);
            return { ...p, bloque: 4 };
        }
    }

    function mostrarPregunta() {

        showQuiz();
        const preguntaObj = obtenerPreguntaPorPuntos(puntos);

        document.getElementById("quizQuestion").textContent = preguntaObj.pregunta;

        window.respuestaCorrecta = preguntaObj.respuesta;
        window.bloqueActual = preguntaObj.bloque;  // ✔ AHORA SE GUARDA

        document.getElementById("quizAnswer").value = "";
    }

    function revisarRespuesta() {
        const respuestaUsuario = document.getElementById("quizAnswer").value.trim();

        if (respuestaUsuario === window.respuestaCorrecta) {

            if (window.bloqueActual === 1) ganarPuntos(2);
            else if (window.bloqueActual === 2) ganarPuntos(4);
            else if (window.bloqueActual === 3) ganarPuntos(6);
            else if (window.bloqueActual === 4) ganarPuntos(8);

        }

        hideQuiz();
        mostrarPregunta(puntosJugador);
    }

    function hideQuiz() {
        document.getElementById("quizPopup").classList.add("hidden");
    }

    function showQuiz() {
        document.getElementById("quizPopup").classList.remove("hidden");
    }

    function ganarPuntos(cantidad = 1) {
        puntos += cantidad;
        document.getElementById("puntaje").textContent = puntos;
    }


    //Iniciar el Juego, Ver para futuro implementar mas niveles

    function iniciarCapiMates() {
        juegoActivo = true;
        puntos = 0;
        vidas = 3;

        generadorObstaculos();
        mostrarPregunta(puntosJugador);
        dibujarVidas();
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
