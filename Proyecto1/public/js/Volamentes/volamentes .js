// Arreglo de preguntas
const preguntas = [




];

// Seleccionamos el contenedor principal
const contenedorJuego = document.getElementById("contenedor_juego");
const btnSiguiente = document.getElementById("btnSiguiente")

//Indice de la pregunta actual
let Indice = -1;

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
        const opcionDiv = document.createElement("button");
        opcionDiv.textContent = opcion;
        opcionDiv.className = "opcion-btn";


        //Evento click en cada opción
        opcionDiv.addEventListener("click", () => {
            const todas = opcionesDiv.querySelectorAll(".opcion-btn");

            if (opcion !== p.correcta) {
                opcionDiv.style.backgroundColor = "red";
                todas.forEach(b => {
                    if (b.textContent !== p.correcta) b.style.backgroundColor = "red";
                });
                return;
            }

            // si es correcta
            opcionDiv.style.backgroundColor = "green";
            todas.forEach(b => b.disabled = true);
        });

        opcionesDiv.appendChild(opcionDiv);
    });

    //Elemnto de puntaje (Vacio por ahora)
    const puntaje = document.createElement("p");
    puntaje.id = "Puntaje"

    // Agregar todo el contenedor principal

    contenedorJuego.appendChild(contenedorPregunta);
    contenedorJuego.appendChild(opcionesDiv);
    contenedorJuego.appendChild(puntaje);

}





// Función que muestra la primera pregunta de forma simple
function iniciarVolamentes() {


    // Crear elemento de puntaje (Inicialemnte vacío)
    const puntaje = document.createElement("p");
    puntaje.id = "puntaje";

    //Agregar todo al contenedor principal
    contenedorJuego.appendChild(contenedorPregunta);
    contenedorJuego.appendChild(opcionesDiv);
    contenedorJuego.appendChild(puntaje);
}

// Botón Siguiente
btnSiguiente.addEventListener("click", () => {
    Indice++;

    if (Indice >= preguntas.length) {
        contenedorJuego.innerHTML = "<h2>Juego Termiando</h2>"
        return;
    }
    mostraPreguntas();
});
