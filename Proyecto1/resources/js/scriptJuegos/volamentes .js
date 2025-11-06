const preguntas = [
    {
        texto: "¿Cómo se muestra un mensaje en consola en JavaScript?",
        antes: "",
        despues: "('Hola Mundo');",
        opciones: ["alert, ", "console.log", "print"],
        correcta: "console.log"
    },
    {
        texto: "¿Cómo se declara una variable en JavaScript?",
        antes: "",
        despues: ' nombre = "Juan";',
        opciones: ["let, ", "varr", "constante"],
        correcta: "let"
    },
    {
        texto: "¿Qué método convierte un JSON a objeto en JS?",
        antes: "const obj =",
        despues: "('textoJSON');",
        opciones: ["JSON.parse, ", "JSON.stringify", "parseJSON"],
        correcta: "JSON.parse"
    },

];

let indice = 0;
let puntaje = 0;
let seleccionActual = null;

const contenedor = document.getElementById("contenedor_pregunta");
const btnSiguiente = document.getElementById("btnSiguiente");
const puntajeTexto = document.getElementById("puntaje");

function mostrarPregunta() {
    const p = preguntas[indice];
    contenedor.innerHTML = `<p><b>Pregunta ${indice + 1}:</b></p>
    <div class="linea-codigo">
        <span>${p.antes}</span>
        <span class="dropzone" id="zona">[ Código ]</span>
        <span>${p.despues}</span>
    </div>
    <div class="opciones">
    ${p.opciones.map(op => `<div class="codigo" data-text="${op}"></div>`).join("")}
    </div>
    <p id="menaje"></p>
    `;


    seleccionActual = null;
    const opciones = contenedor.querySelectorAll('.codigo');
    const zona = contenedor.querySelector('#zona');
    const mensaje = contenedor.querySelector('#menaje');

    opciones.forEach(op => {
        op.addEventListener('click', () => {
            if (seleccionActual == op) {
                op.classList.remove('seleccionado');
                seleccionActual = null;
            } else {
                opciones.forEach(o => o.classList.remove('seleccionado'));
                op.classList.add('seleccionado');
                seleccionActual = op;
            }
        });
    });


    zona.addEventListener('click', () => {
        if (zona.dataset.fijado === "true") {
            zona.textContent = "[ Código ]";
            zona.dataset.fijado = "false";
            zona.classList.remove('correcto', 'incorrecto');
            mensaje.textContent = "";
            return;
        }

        if (!seleccionActual) {
            mensaje.textContent = "Haz clic primero en un opcion";
            mensaje.style.color = "#f44336";
            return;
        }

        const texto = seleccionActual.dataset.text;
        zona.textContent = texto;

        if (texto === p.correcta) {
            zona.classList.add('correcto');
            mensaje.textContent = "¡Correcto!";
            mensaje.style.color = "#4CAF50";
            zona.dataset.fijado = "true";
            puntaje++;
            btnSiguiente.style.display = "inline-block";

        } else {
            zona.classList.add('incorrecto');
            mensaje.textContent = "Incorrecto, intenta de nuevo.";
            mensaje.style.color = "#f44336";
            setTimeout(() => {
                zona.textContent = "[ Código ]";
                zona.classList.remove('incorrecto');
            }, 1000);
        }
    });

    actualizarPuntaje();
    btnSiguiente.style.display = "none";
}

function actualizarPuntaje() {
    puntajeTexto.textContent = `Puntaje: ${puntaje} / ${preguntas.length}`;
}


btnSiguiente.addEventListener('click', () => {
    indice++;
    if (indice < preguntas.length) {
        mostrarPregunta();
    } else {
        contenedor.innerHTML = `<h2>Has completado Volamentes!</h2>
    <p>Tu puntuación final es: <b>${puntaje} / ${preguntas.length}</b></p>
    `;
        btnSiguiente.style.display = "none";
    }
});

mostrarPregunta();



