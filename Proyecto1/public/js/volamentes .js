// Arreglo de preguntas
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
    {
        texto: "¿Cómo se crea una función en JavaScript?",
        antes: "function",
        despues: "(nombre) { /* código */ }",
        opciones: ["func", "function", "def"],
        correcta: "function"
    },
    {
        texto: "¿Qué operador sirve para sumar números?",
        antes: "let resultado = 5",
        despues: "3;",
        opciones: ["+", "-", "*"],
        correcta: "+"
    },
    {
        texto: "¿Cómo se hace un comentario de una línea?",
        antes: "",
        despues: "",
        opciones: ["// Esto es un comentario", "/* Comentario */", "# Comentario"],
        correcta: "// Esto es un comentario"
    },
    {
        texto: "¿Cuál es la forma correcta de declarar un arreglo?",
        antes: "const miArreglo = ",
        despues: ";",
        opciones: ["[]", "{}", "()"],
        correcta: "[]"
    },
    {
        texto: "¿Qué palabra reservada crea una constante?",
        antes: "",
        despues: ' PI = 3.14;',
        opciones: ["let", "const", "var"],
        correcta: "const"
    },
    {
        texto: "¿Cómo se llama un bucle que se repite mientras una condición sea verdadera?",
        antes: "while (condición) {",
        despues: " /* código */ }",
        opciones: ["for", "while", "do"],
        correcta: "while"
    },
    {
        texto: "¿Qué función convierte un objeto a JSON?",
        antes: "",
        despues: "(objeto);",
        opciones: ["JSON.parse", "JSON.stringify", "Object.toJSON"],
        correcta: "JSON.stringify"
    }
];

// Seleccionamos el contenedor principal
const contenedorJuego = document.getElementById("contenedor_juego");
const btnSiguiente = document.getElementById("btnSiguiente")

//Indice de la pregunta actual / Empezar desde 0
let Indice = 0;

// Fúncion que muestra la pregunta actual
function mostraPreguntas() {
    const p = preguntas[Indice];

    // Limpiar el contenedor principal
    contenedorJuego.innerHTML = "";

    // Crear contenedor de la pregunta
    const contenedorPregunta = document.createElement("div");
    contenedorPregunta.id = "contenedor_pregunta";



    // Crear párrafo para mostrar la pregunta
    const preguntaTexto = document.createElement("p");
    preguntaTexto.textContent = p.texto;
    // Agregar la pregunta al contenedor
    contenedorPregunta.appendChild(preguntaTexto);



    // Crear contenedor de opciones
    const opcionesDiv = document.createElement("div");
    opcionesDiv.id = "opciones";

    p.opciones.forEach(opcion => {
        const opcionBtn = document.createElement("button");
        opcionBtn.textContent = opcion;

        //Evento click en cada opción
        opcionBtn.addEventListener("click", () => {
            const todos = opcionesDiv.querySelectorAll("button");

            // Bloquear todos los botones despúes de un click
            todos.forEach(b => b.disabled = true);

            // Colorear la respuesta correcta/incorrecta
            if (opcion === p.correcta) {
                opcionBtn.classList.add("correcta");
            }else{
                opcionBtnñ.classList.add("incorrecta")
                // Marcar la correcta también

                todos.forEach(b => {
                    if(b.textContent === p.correcta) b.classList.add("correcta")
                });
            }

    });

    opcionesDiv.appendChild(opcionBtn);
});

contenedorJuego.appendChild(contenedorPregunta);
contenedorJuego.appendChild(opcionesDiv);
}

// Mostrar primera pregunta al cargar
mostraPreguntas();


// Botón Siguiente
btnSiguiente.addEventListener("click", () => {
    Indice++;

    if (Indice >= preguntas.length) {
        contenedorJuego.innerHTML = "<h2>Juego Termiando</h2>"
        btnSiguiente.disabled = true;
        return;
    }
    mostraPreguntas();
});

