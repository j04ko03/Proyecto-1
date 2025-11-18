
console.log('Entrada al segundo Script');

//Insertar dinámicamente el script que contiene inicializadorAstro --> El script está definido en layout privado con una array TODO: crear otro script para añadir las rutas con array
const scriptAstro = document.createElement("script");
scriptAstro.src = window.rutaScripts.astroInicializador;
console.log(scriptAstro.src);
scriptAstro.type = "text/javascript";

//Cuando el script se cargue, llamar a la función
scriptAstro.onload = () => {
    console.log("Astro.js cargado correctamente");
    if (typeof inicializadorAstro === "function") {
        inicializadorAstro(); //Llamada segura a la función, evitamos que pete la función
    } else {
        console.error("inicializadorAstro no está definido");
    }
};

//Pongo el script en el body
document.body.appendChild(scriptAstro);

//Empieza el juego en este punto. TODO: idea, quiero hacer un timmer para los puntos. Para el tiempo del nivel se coge el local y se hace una resta

/*
  Misión Matemática — Nivel 1 (sencillo, pixel retro)
  Autor: @Josep Guiu Sillés
  Controles: Flechas izquierda/derecha, Espacio para saltar, E para interactuar con bloque
*/