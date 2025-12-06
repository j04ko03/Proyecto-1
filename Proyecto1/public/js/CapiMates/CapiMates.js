window.iniciarCapiMates = function () {
    console.log("🚀 CapiMates Jugable iniciado");

    let juegoActivo = false;
    let rocaInterval, troncoInterval;
    let animacionId;
    let obstaculosArray = [];
    let intervaloPreguntas;
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    let datosSesionIdX = 0;
    let usuarioId = null;
    let juegoId = null;


    /* ------------- UI CAPIMATES izq ------------- */
    let vidas = 3;


    /* ------------- UI CAPIMATES der ------------- */
    let puntos = 0;
    let ultimoPuntoTiempo = 0;

    /* ------------- JUGADOR ------------- */

    let personajeY = 5;           // posición vertical bottom
    let velocidadY = 0;            // velocidad vertical
    let enSuelo = true;            // está tocando suelo

    const GRAVEDAD = 0.05;
    const FUERZA_SALTO = 3;

    // Estados
    let saltando = false;
    let cayendo = false;

    // Animaciones
    const imgIdle = "url('/Proyecto-1/Proyecto1/Astro/piederecho2.png')";
    const imgSalto = "url('/Proyecto-1/Proyecto1/Astro/saltoderecha1.png')";

    let keys = {};

    // Botones y elementos del DOM

    const msg = document.getElementById('mensaje');
    const startBtn = document.getElementById('start-btn');
    const revisarRestuestaBtn = document.getElementById('revisar-respuesta-btn');
    const cerrarPopup = document.getElementById('cerrar-popup');
    const juegoCapiMates = document.getElementById('juegoCapiMates');
    const personaje = document.getElementById('personaje');
    const enemigoContainer = document.getElementById('enemigos');

    // Bloques de preguntas

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

    revisarRestuestaBtn.addEventListener('click', () => {
        revisarRespuesta();
    });

    cerrarPopup.addEventListener('click', () => {
        cerrarPopUp();
    });

    // Logicas de jugador

    window.addEventListener("keydown", e => {

        if ((e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space")
            && enSuelo) {

            velocidadY = FUERZA_SALTO;
            enSuelo = false;
            saltando = true;
            cayendo = false;
        }

    });

    window.addEventListener("keyup", e => {
        keys[e.code] = false;
    });

    function actualizarFisicas() {
        // SI ESTÁ EN EL AIRE → aplicar gravedad
        if (!enSuelo) {
            velocidadY -= GRAVEDAD;
            personajeY += velocidadY;
        }

        // SUELO REAL DEL JUEGO
        const sueloY = 14;

        // Llega al suelo
        if (personajeY <= sueloY) {
            personajeY = sueloY;
            velocidadY = 0;
            enSuelo = true;
            saltando = false;
            cayendo = false;
        }

        // Estados según velocidad
        if (!enSuelo) {
            if (velocidadY > 0) {
                saltando = true;
                cayendo = false;
            } else if (velocidadY < -2) {
                saltando = false;
                cayendo = true;
            }
        }

        actualizarAnimacion();

    }

    function actualizarAnimacion() {

        if (enSuelo) {
            personaje.style.backgroundImage = imgIdle;
            return;
        }

        if (saltando) {
            personaje.style.backgroundImage = imgSalto;
            return;
        }

        if (cayendo) {
            personaje.style.backgroundImage = imgSalto;
            return;
        }

    }

    function dibujarJugador() {
        personaje.style.bottom = personajeY + "px";
    }

    // Mensajes de juego

    function mostrarMensaje(title, body) {
        msg.style.display = 'block';
        document.getElementById('msg-title').textContent = title;
        document.getElementById('msg-body').innerHTML = body;


        pausarJuego();
    }

    function ocultarMensaje() {
        msg.style.display = 'none';
        reanudarJuego();
    }

    function cerrarPopUp() {
        hideQuiz();
        reanudarJuego();
    }

    // Logica de obstaculos

    function generadorObstaculos() {

        if (!juegoActivo) return;

        rocaInterval = setInterval(() => {
            let roca = document.createElement("div");
            roca.classList.add("obstaculo");
            roca.style.animation = "respawn 10s linear infinite";


            enemigoContainer.appendChild(roca);
            obstaculosArray.push(roca);

        }, 3000);

        troncoInterval = setInterval(() => {
            let tronco = document.createElement("div");
            tronco.classList.add("obstaculo1");
            tronco.style.animation = "respawn 10s linear infinite";

            enemigoContainer.appendChild(tronco);
            obstaculosArray.push(tronco);
            console.log("Tronco agregado");

        }, 4000);
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
            clearInterval(intervaloPreguntas);

            guardarPuntuacionFinal();

            // DESBLOQUEAR SIGUIENTE JUEGO
            fetch('/Proyecto-1/Proyecto1/public/juegos/capimates/desbloquear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    juegoId: juegoId   // ID del juego actual desde tus cookies
                })
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Juego desbloqueado:", data);

                    if (data.status === "ok") {
                        mostrarMensaje(
                            "¡Juego completado!",
                            "¡Has desbloqueado un nuevo juego! 🎉"
                        );
                    } else if (data.status === "already-unlocked") {
                        mostrarMensaje(
                            "Juego ya desbloqueado",
                            "El siguiente juego ya estaba disponible."
                        );
                    } else if (data.status === "no-more-games") {
                        mostrarMensaje(
                            "¡Fin de la aventura!",
                            "No hay más juegos para desbloquear."
                        );
                    }

                    setTimeout(() => {
                        location.reload();
                    }, 2000);

                })
                .catch(err => {
                    console.error("ERROR AL DESBLOQUEAR:", err);
                    mostrarMensaje("Error", "No se pudo desbloquear el siguiente juego.");
                });
        }
    }

    function guardarPuntuacionFinal() {

        fetch('/Proyecto-1/Proyecto1/public/juegos/capimates/finalizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                datosSesionId: datosSesionIdX,
                score: puntos,
                numeroIntentos: 0,
                errores: 0,
                puntuacion: puntos,
                helpclicks: 0,
                returningPlayer: false
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log("✔ Puntuación guardada en BD:", data);
            })
            .catch(err => {
                console.error("❌ ERROR al guardar puntuación:", err);
            });

    }

    function dibujarVidas() {

        vidasPanel.innerHTML = `
        <img id="corazon1" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" class="vida-img">
        <img id="corazon2" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" class="vida-img">
        <img id="corazon3" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" class="vida-img">
    `;

    }


    // Preguntas

    function obtenerBloqueAleatorio() {
        const bloques = [bloque1, bloque2, bloque3, bloque4];
        return bloques[Math.floor(Math.random() * bloques.length)];
    }

    function obtenerPreguntaAleatoria(bloque) {
        return bloque[Math.floor(Math.random() * bloque.length)];
    }

    function mostrarPregunta() {

        pausarJuego();
        showQuiz();

        const bloque = obtenerBloqueAleatorio();
        const preguntaObj = obtenerPreguntaAleatoria(bloque);

        document.getElementById("quizQuestion").textContent = preguntaObj.pregunta;

        window.respuestaCorrecta = preguntaObj.respuesta;

        document.getElementById("quizAnswer").value = "";

    }

    function showQuiz() {
        document.getElementById("quizPopup").classList.remove("hidden");
    }

    function hideQuiz() {
        document.getElementById("quizPopup").classList.add("hidden");
    }

    function revisarRespuesta() {
        const respuestaUsuario = document.getElementById("quizAnswer").value.trim();

        if (respuestaUsuario === window.respuestaCorrecta) {
            ganarPuntos(5);

        }

        hideQuiz();
        reanudarJuego();
    }

    function ganarPuntos(cantidad = 1) {
        puntos += cantidad;
        document.getElementById("puntaje").textContent = puntos;
    }


    //Iniciar el Juego, Ver para futuro implementar mas niveles

    function iniciarCapiMates() {

        const dades = extreureCookie("user");
        usuarioId = dades.user;
        juegoId = parseInt(dades.game);

        // 1. Crear la sesión en server
        fetch('/Proyecto-1/Proyecto1/public/juegos/capimates/iniciar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                usuarioId: usuarioId,
                juegoId: juegoId
            })
        })
            .then(res => res.json())
            .then(data => {

                datosSesionIdX = data.datosSesionId;

                // 2. Iniciar juego realmente
                juegoActivo = true;
                puntos = 0;
                vidas = 3;

                intervaloPreguntas = setInterval(() => {
                    if (juegoActivo) mostrarPregunta();
                }, 15000);

                dibujarVidas();
                loop();

            }).catch(err => {
                console.error("ERROR al iniciar sesión del juego:", err);
            });
    }

    function extreureCookie(clau) {
        const cookies = document.cookie.split('; ');
        let vuelta = null;

        for (let c of cookies) {
            const [key, value] = c.split('=');
            if (key === clau) {
                vuelta = JSON.parse(value);
            }
        }
        return vuelta;
    }

    // Logicas del juego

    function pausarJuego() {
        juegoActivo = false;

        juegoCapiMates.classList.add("paused");

        for (let obs of obstaculosArray) {
            obs.style.animation = "none";
            obs.dataset.oldLeft = obs.style.left;
            obs.style.left = "2000px";
        }

        // Detener generación de obstáculos
        clearInterval(rocaInterval);
        clearInterval(troncoInterval);
    }

    function reanudarJuego() {
        juegoActivo = true;

        // Reanudar animación del fondo
        juegoCapiMates.classList.remove("paused");

        for (let obs of obstaculosArray) {

            // Restaurar posición donde estaba
            if (obs.dataset.oldLeft) {
                obs.style.left = obs.dataset.oldLeft;
            }

            // Restaurar animación
            if (obs.classList.contains("obstaculo")) {
                obs.style.animation = "respawn 10s linear infinite";
            } else if (obs.classList.contains("obstaculo1")) {
                obs.style.animation = "respawn1 10s linear infinite";
            }
        }

        generadorObstaculos();

        // Volver al bucle del juego
        if (!animacionId) loop();
    }

    // Cosas que se tienen que repetir en el juego

    function loop(timestamp) {
        if (!juegoActivo) {
            animacionId = null;
            return;
        }

        actualizarFisicas();
        dibujarJugador();
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
