window.inicializarVolamentesX = function () {
    
console.log("Volamentes.js ejecutando...");

// Arreglo de preguntas para niños
const niveles = [
    {
        nombre: "Fácil",
        fondo: '',
        preguntas: [
            {
                preguntas: "¿Qué color es el cielo?",
                opciones: ["Verde", "Azul", "Rojo"],
                correcta: 1
            },
            {
                preguntas: "¿Cuanto es 2 + 2?",
                opciones: ["3", "4", "5"],
                correcta: 1
            },
            {
                preguntas: "¿Que animal dice 'Miau'?",
                opciones: ["Perro", "Gato", "Vaca"],
                correcta: 1
            }
        ]
    },
    {
        nombre: "Medio",
        fondo: '',
        preguntas: [
            {
                preguntas: "¿Cual es la fruta amarilla?",
                opciones: ["Manzana", "Platano", "Uva"],
                correcta: 1
            }, {
                pregunta: "¿Qué instrumento tiene teclas y suena así: 'do re mi'?",
                opciones: ["Guitarra", "Piano", "Batería"],
                correcta: 1
            }, {
                pregunta: "¿Qué animal nada en el agua?",
                opciones: ["Pez", "Perro", "Caballo"],
                correcta: 0
            }
        ]
    },
    {
        nombre: "Difícil",
        fondo: '',
        preguntas: [
            {
                pregunta: "Si tengo 5 manzanas y me como 2, ¿Cuántas quedan?",
                opciones: ["2", "3", "4"],
                correcta: 1
            },
            {
                pregunta: "¿Cuál es la capital de España?",
                opciones: ["Madrid", "Barcelona", "Sevilla"],
                correcta: 0
            },{
                pregunta: "¿Qué número sigue: 2, 4, 6, ___ ?",
                opciones: ["7", "8", "6"],
                correcta: 1
            }
        ]
    }

];

let nivelActual = 0;
let preguntaActual = 0;
let puntaje = 0;

const fondo = document.getElementById("fondo");
const textoPregunta = document.getElementById("textoPregunta");
const opcionesDiv = document.getElementById("opciones");
const puntajeTxt = document.getElementById("puntaje");
const btnSiguiente = document.getElementById("btnSiguiente");


// Función para actualizar el fondo según el nivel actual
function actualizarFondo() {
    fondo.style.backgroundImage = niveles[nivelActual].fondo
}

// Cargar pregunta
function cargarPregunta() {
    const nivel = niveles[nivelActual];
    const p = nivel.preguntas[preguntaActual];

    textoPregunta.textContent = p.preguntas;
    opcionesDiv.innerHTML = "";

    p.opciones.forEach((op, index) => {
        const btn = document.createElement("button");
        btn.classList.add("opcion-btn");
        btn.textContent = op;

        btn.onclick = () => seleccionarRespuesta(index);

        opcionesDiv.appendChild(btn);
    });
}

// Seleccionar respuesta
function seleccionarRespuesta(index) {
    const nivel = niveles[nivelActual];
    const p = nivel.preguntas[preguntaActual];

    const botones = document.querySelectorAll(".opcion-btn");

    botones.forEach((b) => (b.disable = true));

    if (index === p.correcta) {
        botones[index].classList.add("correcta");
        puntaje+=10;
    }else {
        botones[index].classList.add("incorrecta");
        botones[p.correcta].classList.add("correcta");
    }
    puntajeTxt.textContent = "Puntaje: " + puntaje;


btnSiguiente.addEventListener("click", () => {
    const nivel = niveles[nivelActual];

    // si estamos iniciando
    if(preguntaActual === 0 && puntaje === 0){
        actualizarFondo();
        cargarPregunta();
        return;
    }

    preguntaActual++;

    // Si el nivel termió
    if (preguntaActual >= nivel.preguntas.length) {
        nivelActual++;
        preguntaActual = 0;

        // si no hay más niveles
        if (nivelActual >= niveles.length) {
            textoPregunta.textContent = "¡Felicidades haz terminado todo los niveles!";
            opcionesDiv.innerHTML = "";
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


} 
window.inicializarVolamentes = inicializarVolamentesX;
