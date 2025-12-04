// Versión corregida y estabilizada de Volamentes
window.inicializarVolamentes = function () {

    console.log("inicializarVolamentes ejecutando...");

    // Arreglo de preguntas para niños (estructura tolerante a variantes)
    const niveles = [
        {
            nombre: "Fácil",
            fondo: '',
            preguntas: [
                { pregunta: "¿Qué color es el cielo?", opciones: ["Verde", "Azul", "Rojo"], correcta: 1 },
                { pregunta: "¿Cuánto es 2 + 2?", opciones: ["3", "4", "5"], correcta: 1 },
                { pregunta: "¿Qué animal dice 'Miau'?", opciones: ["Perro", "Gato", "Vaca"], correcta: 1 }
            ]
        },
        {
            nombre: "Medio",
            fondo: '',
            preguntas: [
                { pregunta: "¿Cuál es la fruta amarilla?", opciones: ["Manzana", "Plátano", "Uva"], correcta: 1 },
                { pregunta: "¿Qué instrumento tiene teclas y suena así: 'do re mi'?", opciones: ["Guitarra", "Piano", "Batería"], correcta: 1 },
                { pregunta: "¿Qué animal nada en el agua?", opciones: ["Pez", "Perro", "Caballo"], correcta: 0 }
            ]
        },
        {
            nombre: "Difícil",
            fondo: '',
            preguntas: [
                { pregunta: "Si tengo 5 manzanas y me como 2, ¿Cuántas quedan?", opciones: ["2", "3", "4"], correcta: 1 },
                { pregunta: "¿Cuál es la capital de España?", opciones: ["Madrid", "Barcelona", "Sevilla"], correcta: 0 },
                { pregunta: "¿Qué número sigue: 2, 4, 6, ___ ?", opciones: ["7", "8", "6"], correcta: 1 }
            ]
        }
    ];

    let nivelActual = 0;
    let preguntaActual = 0;
    let puntaje = 0;
    let respuestaSeleccionada = false;

    const fondo = document.getElementById("fondo");
    const textoPregunta = document.getElementById("textoPregunta");
    const opcionesDiv = document.getElementById("opciones");
    const puntajeTxt = document.getElementById("puntaje");
    const btnSiguiente = document.getElementById("btnSiguiente");

    function actualizarFondo() {
        if (!fondo) return;
        const f = niveles[nivelActual] && niveles[nivelActual].fondo;
        fondo.style.backgroundImage = f || '';
    }

    function cargarPregunta() {
        const nivel = niveles[nivelActual];
        if (!nivel || !Array.isArray(nivel.preguntas)) {
            textoPregunta && (textoPregunta.textContent = "No hay preguntas para este nivel.");
            opcionesDiv && (opcionesDiv.innerHTML = "");
            return;
        }

        const p = nivel.preguntas[preguntaActual];
        if (!p) {
            textoPregunta && (textoPregunta.textContent = "Pregunta no encontrada.");
            opcionesDiv && (opcionesDiv.innerHTML = "");
            return;
        }

        const texto = p.pregunta || p.preguntas || p.texto || "";
        if (textoPregunta) textoPregunta.textContent = texto;

        opcionesDiv.innerHTML = "";
        respuestaSeleccionada = false;

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
            puntaje += 10;
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
                actualizarFondo();
                cargarPregunta();
                return;
            }

            // No avanzar si el usuario no ha respondido la pregunta actual
            if (!respuestaSeleccionada) return;

            // avanzar a la siguiente pregunta
            preguntaActual++;

            // Si el nivel terminó
            if (preguntaActual >= (nivel && nivel.preguntas ? nivel.preguntas.length : 0)) {
                nivelActual++;
                preguntaActual = 0;

                // si no hay más niveles
                if (nivelActual >= niveles.length) {
                    if (textoPregunta) textoPregunta.textContent = "¡Felicidades, has terminado todos los niveles!";
                    if (opcionesDiv) opcionesDiv.innerHTML = "";
                    btnSiguiente.style.display = "none";
                    return;
                }

                actualizarFondo();
                cargarPregunta();
                return;
            }

            cargarPregunta();
        });
    }

    // Inicializamos los textos visible
    if (puntajeTxt) puntajeTxt.textContent = "Puntaje: " + puntaje;
    if (textoPregunta) textoPregunta.textContent = "Pulsa 'Siguiente' para empezar";
};
