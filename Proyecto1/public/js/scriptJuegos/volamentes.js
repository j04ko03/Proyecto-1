const preguntas = [
    {
        texto: "¿Cómo se muestra un mensaje en consola en JavaScript?",
        antes: "",
        despues: "('Hola Mundo');",
        opciones: ["alert", "console.log", "print"],
        correcta: "console.log"
    },
    {
        texto: "¿Cómo se declara una variable en JavaScript?",
        antes: "",
        despues: ' nombre = "Juan";',
        opciones: ["let", "var", "const"],
        correcta: "let"
    },
    {
        texto: "¿Qué método convierte un JSON a objeto en JS?",
        antes: "const obj =",
        despues: "('textoJSON');",
        opciones: ["JSON.parse", "JSON.stringify", "parseJSON"],
        correcta: "JSON.parse"
    },

];

let indice = 0;
let puntaje = 0;
let seleccionActual = null;

const contenedor = document.getElementById("contenedor_pregunta");
const btnSiguiente = document.getElementById("btnSiguiente");
const puntajeTexto = document.getElementById("puntaje");

// Estado para saber si ya iniciamos el juego
let juegoIniciado = false;

// Esconde el boton al iniciar
btnSiguiente.textContent = "Iniciar";
btnSiguiente.style.display = "inline-block";

// Limpiar el contenedor y puntuaje al principio
contenedor.innerHTML = "";
puntajeTexto.textContent = "";

function mostrarPregunta() {
    // const p = preguntas[indice];
    // contenedor.innerHTML = `<p><b>Pregunta ${indice + 1}:</b> ${p.texto}</p>
    // <div class="linea-codigo">
    //     <span>${p.antes}</span>
    //     <span class="dropzone" id="zona">[ Código ]</span>
    //     <span>${p.despues}</span>
    // </div>
    // <div class="opciones">

    // </div>
    // <p id="menaje"></p>`;
// Importante: Corregir para sacar las opciones bien y que las repuestas cambien de color en funcion de la correcta
//Crear un Json donde esten las preguntas y cargarlas entro del element.
//
    let myOpcion = document.createElement("span");
    myOpcion.textContent = "Hola";
    let elemento = document.getElementById("menaje");
    elemento.appendChild(myOpcion);
    myOpcion.addEventListener('click', () => {
        console.log('Has hecho click en el mensaje');
    });


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
            mensaje.textContent = "Haz clic primero en una opción";
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
    // ocultamos el botón hasta que acierten la pregunta
    btnSiguiente.style.display = "none";
}





// No llamar mostrarPregunta() automáticamente para que el usuario inicie con el botón

// inicializar mostrando puntaje 0
