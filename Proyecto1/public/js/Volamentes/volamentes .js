const { act } = require("react");

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



// // Seleccionamos el contenedor principal
// const contenedorJuego = document.getElementById("contenedor_juego");
// const btnSiguiente = document.getElementById("btnSiguiente")

// //Indice de la pregunta actual
// let Indice = -1;

// // Fúncion que muestra la pregunta actual
// function mostraPreguntas() {
//     const p = preguntas[Indice];

//     // Limpiar el contenedor principal
//     contenedorJuego.innerHTML = "";

//     // Crear contenedor de la pregunta
//     const contenedorPregunta = document.createElement("div");
//     contenedorPregunta.id = "contenedor_pregunta";



//     // Crear párrafo para mostrar la pregunta
//     const preguntaTexto = document.createElement("p");
//     preguntaTexto.textContent = p.texto;
//     // Agregar la pregunta al contenedor
//     contenedorPregunta.appendChild(preguntaTexto);



//     // Crear contenedor de opciones
//     const opcionesDiv = document.createElement("div");
//     opcionesDiv.id = "opciones";

//     p.opciones.forEach(opcion => {
//         const opcionDiv = document.createElement("button");
//         opcionDiv.textContent = opcion;
//         opcionDiv.className = "opcion-btn";


//         //Evento click en cada opción
//         opcionDiv.addEventListener("click", () => {
//             const todas = opcionesDiv.querySelectorAll(".opcion-btn");

//             if (opcion !== p.correcta) {
//                 opcionDiv.style.backgroundColor = "red";
//                 todas.forEach(b => {
//                     if (b.textContent !== p.correcta) b.style.backgroundColor = "red";
//                 });
//                 return;
//             }

//             // si es correcta
//             opcionDiv.style.backgroundColor = "green";
//             todas.forEach(b => b.disabled = true);
//         });

//         opcionesDiv.appendChild(opcionDiv);
//     });

//     //Elemnto de puntaje (Vacio por ahora)
//     const puntaje = document.createElement("p");
//     puntaje.id = "Puntaje"

//     // Agregar todo el contenedor principal

//     contenedorJuego.appendChild(contenedorPregunta);
//     contenedorJuego.appendChild(opcionesDiv);
//     contenedorJuego.appendChild(puntaje);
// }

// // Función que muestra la primera pregunta de forma simple
// function iniciarVolamentes() {


//     // Crear elemento de puntaje (Inicialemnte vacío)
//     const puntaje = document.createElement("p");
//     puntaje.id = "puntaje";

//     //Agregar todo al contenedor principal
//     contenedorJuego.appendChild(contenedorPregunta);
//     contenedorJuego.appendChild(opcionesDiv);
//     contenedorJuego.appendChild(puntaje);
// }

// // Botón Siguiente
// btnSiguiente.addEventListener("click", () => {
//     Indice++;

//     if (Indice >= preguntas.length) {
//         contenedorJuego.innerHTML = "<h2>Juego Termiando</h2>"
//         return;
//     }
//     mostraPreguntas();
// });
