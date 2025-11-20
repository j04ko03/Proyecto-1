console.log('Entrada al segundo Script');

//Insertar dinámicamente el script que contiene inicializadorAstro --> El script está definido en layout privado con una array TODO: crear otro script para añadir las rutas con array
const scriptCapi = document.createElement("script");
scriptCapi.src = window.rutaScripts.capimatesInicializador;
console.log(scriptCapi.src);
scriptCapi.type = "text/javascript";

//Cuando el script se cargue, llamar a la función
scriptCapi.onload = () => {
    console.log("CapiMates.js cargado correctamente");
    if (typeof inicializadorCapiMates === "function") {
        inicializadorCapiMates(); //Llamada segura a la función, evitamos que pete la función
    } else {
        console.error("inicializadorCapiMates no está definido");
    }
};

//Pongo el script en el body
document.body.appendChild(scriptCapi);

//Empieza el juego en este punto. TODO: idea, quiero hacer un timmer para los puntos. Para el tiempo del nivel se coge el local y se hace una resta

/*
  Misión Matemática — Nivel 1 (sencillo, pixel retro)
  Autor: @Josep Guiu Sillés
  Controles: Flechas izquierda/derecha, Espacio para saltar, E para interactuar con bloque
*/