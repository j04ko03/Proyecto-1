// Versión corregida y estabilizada de Volamentes
window.inicializarVolamentes = function () {

    console.log("inicializarVolamentes ejecutando...");

    // Arreglo de preguntas (3 niveles × 3 preguntas) — temas de programación para niños 8-9 años
    const niveles = [
        {
            nombre: "Fácil",
            fondo: '',
            preguntas: [
                { pregunta: "¿Qué hace el comando 'print' en muchos lenguajes?", opciones: ["Dibujar imágenes", "Mostrar texto en pantalla", "Borrar archivos"], correcta: 1 },
                { pregunta: "¿Qué es una variable?", opciones: ["Un lugar donde guardas un valor", "Un tipo de comida", "Un dibujo"], correcta: 0 },
                { pregunta: "¿Para qué sirve un bucle (loop)?", opciones: ["Repetir acciones varias veces", "Guardar datos", "Imprimir texto"], correcta: 0 }
            ]
        },
        {
            nombre: "Medio",
            fondo: '',
            preguntas: [
                { pregunta: "¿Qué hace una condición 'if' en programación?", opciones: ["Elige una acción si se cumple algo", "Cuenta hasta 10", "Dibuja un círculo"], correcta: 0 },
                { pregunta: "¿Qué es una lista (array)?", opciones: ["Una secuencia de elementos ordenados", "Un número", "Una función"], correcta: 0 },
                { pregunta: "¿Qué significa 'debug' o depurar?", opciones: ["Encontrar y arreglar errores", "Escribir música", "Borrar archivos"], correcta: 0 }
            ]
        },
        {
            nombre: "Difícil",
            fondo: '',
            preguntas: [
                { pregunta: "Si quiero repetir algo 5 veces, ¿qué usaría?", opciones: ["Un bucle (loop)", "Una variable", "Un botón"], correcta: 0 },
                { pregunta: "¿Qué hace una función en programación?", opciones: ["Agrupa código que realiza una tarea", "Guarda imágenes", "Cambia el color de la pantalla"], correcta: 0 },
                { pregunta: "¿Por qué es bueno comentar el código?", opciones: ["Para explicar qué hace y facilitar entenderlo", "Para hacerlo más lento", "Para que no funcione"], correcta: 0 }
            ]
        }
    ];

    let nivelActual = 0;
    let preguntaActual = 0;
    let puntaje = 0;
    let respuestaSeleccionada = false;
    let esperaSiguienteNivel = false; // indica que estamos mostrando resumen de nivel
    const puntajesPorNivel = niveles.map(() => 0); /*Mismo array pero de 0*/

    // Puntos y umbrales globales
    const POINTS_PER_QUESTION = 100; // cada pregunta vale 100 puntos
    const MIN_TOTAL_TO_PASS = 700;   // mínimo total para poder pasar al siguiente juego
    // Divide los puntos totales enetre los niveles (Se divide el minimo entre niveles)
    const TARGET_PUNTOS_POR_NIVEL = Math.ceil(MIN_TOTAL_TO_PASS / niveles.length);
    // URL del siguiente juego (puede ser configurada desde la página con `window.siguienteJuegoUrl`)
    const NEXT_GAME_URL = window.siguienteJuegoUrl || window.rutaSiguienteJuego || '/Astro';
    let volverAIntentar = false; // si estamos en último nivel y no alcanzó mínimo

    const fondo = document.getElementById("fondo");
    const textoPregunta = document.getElementById("textoPregunta");
    const opcionesDiv = document.getElementById("opciones");
    const puntajeTxt = document.getElementById("puntaje");
    const btnSiguiente = document.getElementById("btnSiguiente");

    // Usaremos el mismo <h1 class="titulo-juego"> (si existe) para mostrar
    // "Nivel X : Nombre" y mantener el mismo estilo visual.
    const tituloJuegoEl = document.querySelector('.titulo-juego');
    const tituloOriginal = tituloJuegoEl ? tituloJuegoEl.textContent : 'Volamentes';

    // Inyectar estilo para el efecto 'mal' (sacudida / movimiento)
    (function ensureStyles(){
        if (document.getElementById('volamentes-styles')) return;
        const s = document.createElement('style');
        s.id = 'volamentes-styles';
        s.textContent = `
        .mal {
        color: #ff3b3b;
        font-weight: 700;
        animation: shake 0.8s ease-in-out infinite; }
        @keyframes shake { 0%{ transform: translateX(0);}
        20%{ transform: translateX(-8px);} 40%{ transform: translateX(8px);} 60%{ transform: translateX(-6px);} 80%{ transform: translateX(6px);} 100%{ transform: translateX(0);} }
        `;
        document.head.appendChild(s);
    })();

    function mostrarNivelNombre() {
        const nivel = niveles[nivelActual];
        if (tituloJuegoEl && nivel && nivel.nombre) {
            tituloJuegoEl.textContent = `Nivel ${nivelActual + 1} : ${nivel.nombre}`;
        }
    }

    function ocultarNivelNombre() {
        if (tituloJuegoEl) tituloJuegoEl.textContent = tituloOriginal;
    }

    function actualizarFondo() {
        if (!fondo) return;
        const f = niveles[nivelActual] && niveles[nivelActual].fondo;
        fondo.style.backgroundImage = f || '';
    }

    function cargarPregunta() {
// Siempre valida datos antes de usarlos.
// Busca el nivel correspondiente usando el nivelActual
// (Comprueba que nivel el nivel existe y evita errores si alguien borro o modifico datos de niveles)        const nivel = niveles[nivelActual];

        if (!nivel || !Array.isArray(nivel.preguntas)) {
            //si el elemento no existe, no hacer nada
            textoPregunta && (textoPregunta.textContent = "No hay preguntas para este nivel.");
            opcionesDiv && (opcionesDiv.innerHTML = "");
            return;
        }
// Busca la pregunta, si no existe muestra un mensaje de error y limpia las opciones
        const p = nivel.preguntas[preguntaActual];
        if (!p) {
            //si el elemento no existe, no hacer nada
            textoPregunta && (textoPregunta.textContent = "Pregunta no encontrada.");
            opcionesDiv && (opcionesDiv.innerHTML = "");
            return;
        }

        const texto = p.pregunta || p.preguntas || p.texto || "";
        if (textoPregunta) textoPregunta.textContent = texto;

        opcionesDiv.innerHTML = "";
        respuestaSeleccionada = false;
        esperaSiguienteNivel = false;
        // Asegurar que el botón muestra la etiqueta por defecto y lo resetea
        if (btnSiguiente) btnSiguiente.textContent = 'Siguiente';

// Crear un boton para cada opcion, crea un botton por cada respuesta que tenga la pregunta
        p.opciones.forEach((op, index) => {
            const btn = document.createElement("button");
            btn.classList.add("opcion-btn");
            btn.type = "button";
            btn.textContent = op;
            btn.dataset.index = index;

            btn.addEventListener("click", () => seleccionarRespuesta(index));

            opcionesDiv.appendChild(btn);
        });

        // actualizar puntaje visible
        if (puntajeTxt) puntajeTxt.textContent = "Puntaje: " + puntaje;
    }

    function seleccionarRespuesta(index) {

//Busca la pregunta actual dentro del nivel(Si no existe no sale la funcion)
        const nivel = niveles[nivelActual];
        const p = nivel && nivel.preguntas && nivel.preguntas[preguntaActual];
        if (!p) return;

        const botones = opcionesDiv.querySelectorAll(".opcion-btn");

        // Desactivar botones correctamente
        botones.forEach((b) => b.disabled = true);

        // Marcar correcta/incorrecta
        const correctaIdx = p.correcta;
        if (index === correctaIdx) {
            botones[index].classList.add("correcta");
            puntaje += POINTS_PER_QUESTION;
            puntajesPorNivel[nivelActual] += POINTS_PER_QUESTION;
        } else {
            botones[index].classList.add("incorrecta");
            if (botones[correctaIdx]) botones[correctaIdx].classList.add("correcta");
        }

        if (puntajeTxt) puntajeTxt.textContent = "Puntaje: " + puntaje;

        respuestaSeleccionada = true;
    }

    // Listener de Siguiente — se añade una sola vez
    if (btnSiguiente) {
        btnSiguiente.addEventListener("click", () => {
            const nivel = niveles[nivelActual];

            // Si estamos iniciando el juego (primera pulsación para comenzar)
            if (preguntaActual === 0 && puntaje === 0 && !respuestaSeleccionada) {
                // Mostrar título del nivel y cargar la primera pregunta
                mostrarNivelNombre();
                actualizarFondo();
                cargarPregunta();
                return;
            }

            // No avanzar si el usuario no ha respondido la pregunta actual
            if (!respuestaSeleccionada && !esperaSiguienteNivel) return;

            // Si estamos mostrando el resumen del nivel
            if (esperaSiguienteNivel) {
                // Si estamos en modo 'volver a intentar' (último nivel y no alcanzó mínimo)
                if (volverAIntentar) {
                    // reiniciar el juego
                    resetGame();
                    volverAIntentar = false;
                    return;
                }
                // avanzar al siguiente nivel
                nivelActual++;
                preguntaActual = 0;
                respuestaSeleccionada = false;
                esperaSiguienteNivel = false;

                // si no hay más niveles
                if (nivelActual >= niveles.length) {
                    ocultarNivelNombre();
                    if (textoPregunta) textoPregunta.textContent = "¡Felicidades, has terminado todos los niveles!";
                    if (opcionesDiv) opcionesDiv.innerHTML = "";
                    btnSiguiente.style.display = "none";
                    return;
                }

                // Mostrar título del nuevo nivel y cargar sus preguntas
                mostrarNivelNombre();
                actualizarFondo();
                cargarPregunta();
                return;
            }

            // avanzar a la siguiente pregunta
            preguntaActual++;

            // Si el nivel terminó -> mostrar resumen de nivel en lugar de avanzar inmediatamente
            if (preguntaActual >= (nivel && nivel.preguntas ? nivel.preguntas.length : 0)) {
                // Mostrar resumen del nivel actual
                mostrarResumenNivel(nivelActual);
                esperaSiguienteNivel = true;
                // cambiar el texto del botón a "Continuar"
                if (btnSiguiente) btnSiguiente.textContent = 'Continuar';
                return;
            }

            cargarPregunta();
        });
    }

    function mostrarResumenNivel(indiceNivel) {
        const puntos = puntajesPorNivel[indiceNivel] || 0;
        if (textoPregunta) textoPregunta.textContent = `¡Felicidades! Tus puntos en este nivel son ${puntos}.`;
        if (opcionesDiv) opcionesDiv.innerHTML = '';
        // mantener el puntaje total visible
        if (puntajeTxt) puntajeTxt.textContent = `Puntaje total: ${puntaje}`;

            // Mostrar si alcanzó la meta o no
            // eliminamos clases previas
            if (textoPregunta) {
                textoPregunta.classList.remove('mal');
                textoPregunta.classList.remove('bien');
            }

            if (puntos >= TARGET_PUNTOS_POR_NIVEL) {
                // nivel superado
                if (textoPregunta) textoPregunta.textContent += ' 🎉 Objetivo alcanzado.';
            } else {
                // nivel no alcanzado: mostrar mensaje con efecto de movimiento
                if (textoPregunta) {
                    textoPregunta.textContent = `¡Muy mal! Necesitabas ${TARGET_PUNTOS_POR_NIVEL} puntos.`;
                    textoPregunta.classList.add('mal');
                }
            }

            // Si este era el último nivel, comprobamos el mínimo total necesario
            if (nivelActual + 1 >= niveles.length) {
                if (puntaje >= MIN_TOTAL_TO_PASS) {
                    // El jugador alcanza el mínimo global: mostrar sólo el botón para continuar
                    if (!document.getElementById('btnContinuar')) {
                        const btnC = document.createElement('button');
                        btnC.id = 'btnContinuar';
                        btnC.className = 'btn-volamentes';
                        btnC.textContent = 'Continuar al siguiente juego';
                        btnC.style.marginTop = '12px';
                        btnC.addEventListener('click', desbloquearSiguienteJuego);
                        if (opcionesDiv) opcionesDiv.appendChild(btnC);
                    }

                    // ocultar el botón Siguiente y cualquier botón de reinicio
                    if (btnSiguiente) btnSiguiente.style.display = 'none';
                    const rein = document.getElementById('btnReiniciar');
                    if (rein && rein.parentNode) rein.parentNode.removeChild(rein);
                } else {
                    // No alcanzó el mínimo global: cambiar botón Continuar por Volver a Intentar
                    if (textoPregunta) textoPregunta.textContent = 'No has llegado al límite requerido';
                    if (btnSiguiente) {
                        btnSiguiente.textContent = 'Volver a Intentar';
                        volverAIntentar = true;
                    }
                }
            }

        // Opcional: aquí se podría enviar el resultado del nivel al servidor.
        // Se ha eliminado el ejemplo de fetch por claridad. Para guardar en
        // backend usa el endpoint `POST /juego/guardar-volamentes` con JSON
        // que incluya al menos `datosSesionId` y `score`.
    }

    // Opcional: para iniciar la sesión de juego desde el cliente (crear DatosSesion),
    // llama al endpoint `POST /juego/iniciar-volamentes`. El servidor devolverá
    // `datosSesionId` para usar en los posteriores guardados.

    function mostrarResumenFinal() {
        if (textoPregunta) textoPregunta.textContent = `¡Has completado el juego! Puntaje final: ${puntaje}`;
        if (opcionesDiv) opcionesDiv.innerHTML = '';
        if (puntajeTxt) puntajeTxt.textContent = `Puntaje total: ${puntaje}`;
        if (btnSiguiente) btnSiguiente.style.display = 'none';
    }

    // Reinicia las variables del juego y UI para jugar de nuevo
    function resetGame() {
        // reset valores
        nivelActual = 0;
        preguntaActual = 0;
        puntaje = 0;
        respuestaSeleccionada = false;
        esperaSiguienteNivel = false;
        // reset puntajes por nivel
        for (let i = 0; i < puntajesPorNivel.length; i++) puntajesPorNivel[i] = 0;
        volverAIntentar = false;

        // Restaurar UI
        if (puntajeTxt) puntajeTxt.textContent = "Puntaje: 0";
        if (textoPregunta) textoPregunta.textContent = "Pulsa 'Siguiente' para empezar";
        if (tituloJuegoEl) tituloJuegoEl.textContent = tituloOriginal;
        if (opcionesDiv) opcionesDiv.innerHTML = '';
        if (btnSiguiente) {
            btnSiguiente.style.display = '';
            btnSiguiente.textContent = 'Siguiente';
        }

        // eliminar boton reiniciar si existe
        const rein = document.getElementById('btnReiniciar');
        if (rein && rein.parentNode) rein.parentNode.removeChild(rein);

        // quitar clases de animacion
        if (textoPregunta) {
            textoPregunta.classList.remove('mal');
            textoPregunta.classList.remove('bien');
        }
    }

    // Acción para desbloquear el siguiente juego cuando se alcanza el mínimo requerido
    function desbloquearSiguienteJuego() {
    console.log('Desbloqueo: redirigiendo al siguiente juego...');
    if (textoPregunta) textoPregunta.textContent = '¡Siguiente juego desbloqueado! Redirigiendo...';

    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    const intentarFetch = Boolean(window.datosSesionId);

    // Obtener ID del juego actual (Volamentes)
    const juegoActualId = window.juegoActualId || 2; // Ajusta si Volamentes tiene otro id

    if (true) { //* No te entrara nunca en el if.... */
        fetch('/Proyecto-1/Proyecto1/public/juegos/astro/desbloquear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrf
            },
            body: JSON.stringify({ juegoId: juegoActualId }) // <--- enviar juegoId al backend
        })
        .then(res => res.json())
        .then(data => {
            console.log('Respuesta desbloqueo:', data);

            let destino = NEXT_GAME_URL; // URL por defecto
            if (data && data.juegoDesbloqueado) {
                // Redirigir al siguiente juego desbloqueado
                switch(data.juegoDesbloqueado) {
                    case 3: destino = '/CapiMates'; break; // Ajusta según tu ruta en web.php
                    case 4: destino = '/Bosque'; break;
                    case 5: destino = '/Volamentes'; break;
                    default: destino = NEXT_GAME_URL; break;
                }
            }
            /*window.location.href = destino;ESTOI NO TE VA A FUNCIONAR HAZ UN RELOAD DE LA PAGINA   */
            /*window.location.href = NEXT_GAME_URL;*/
            location.reload();
        })
        .catch(err => {
            console.warn('Fetch de desbloqueo falló, redirigiendo localmente.', err);
            /*window.location.href = NEXT_GAME_URL; ESTOI NO TE VA A FUNCIONAR HAZ UN RELOAD DE LA PAGINA   */
            location.reload();
        });
    } else {
        window.location.href = NEXT_GAME_URL;
    }
}

    // Inicializamos los textos visible sdvgdsfvbz
    if (puntajeTxt) puntajeTxt.textContent = "Puntaje: " + puntaje;
    if (textoPregunta) textoPregunta.textContent = "Pulsa 'Siguiente' para empezar";
};
