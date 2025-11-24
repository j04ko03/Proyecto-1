// document.addEventListener("DOMContentLoaded", function () {

    // Objeto para guardar cosas que necesitamos limpiar cuando cambiamos de juego
    window.juegoActivo = {
        intervals: [],  // Guarda los IDs de setInterval
        timeouts: [],   // Guarda los IDs de setTimeout
        listeners: [],  // Guarda los event listeners para poder quitarlos
        cleanup: []     // Guarda funciones extras para limpiar
    };

    // Funciones para registrar cada tipo de recurso para limpiar después
    window.registrarInterval = function (id) {
        juegoActivo.intervals.push(id);
    };

    window.registrarTimeout = function (id) {
        juegoActivo.timeouts.push(id);
    };

    window.registrarCleanup = function (fn) {
        juegoActivo.cleanup.push(fn);
    };

    // Esta función cierra el juego actual: limpia timers, listeners, scripts y borra la pantalla
    window.cerrarJuego = function () {
        console.log("Cerrando juego anterior...");

        // Limpiar todos los intervalos activos
        juegoActivo.intervals.forEach(id => clearInterval(id));
        juegoActivo.intervals = [];

        // Limpiar todos los timeouts activos
        juegoActivo.timeouts.forEach(id => clearTimeout(id));
        juegoActivo.timeouts = [];

        // Ejecutar funciones de limpieza extra si hay
        juegoActivo.cleanup.forEach(fn => fn());
        juegoActivo.cleanup = [];

        // Quitar todos los event listeners añadidos
        juegoActivo.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        juegoActivo.listeners = [];

        // Quitar scripts de juegos cargados para evitar duplicados
        document.querySelectorAll("script[data-juego]").forEach(script => script.remove());

        // Limpiar contenido de la pantalla del juego
        const pantalla = document.getElementById("pantallaJuego");
        if (pantalla) pantalla.innerHTML = "";

        console.log("Juego cerrado completamente");
    };

    // Función para registrar event listeners que queremos limpiar luego
    window.registrarListener = function (element, event, handler) {
        element.addEventListener(event, handler);
        juegoActivo.listeners.push({ element, event, handler });
    };

    // Obtenemos el contenedor donde cargaremos el juego
    const pantalla = document.getElementById("pantallaJuego");

    // Seleccionamos todos los botones o cartuchos que cargan juegos
    const cartuchos = document.querySelectorAll('.cartucho');

    console.log("Cartuchos encontrados:", cartuchos);

    // Para cada botón/cartucho le ponemos un evento click para cargar el juego correspondiente
    cartuchos.forEach(element => {
        element.addEventListener("click", async function (e) {
            e.preventDefault(); // Prevenir comportamiento por defecto

            console.log("Se clickeó el juego:", this.dataset.juego);

            try {
                // Antes de cargar un juego nuevo, cerramos el anterior
                cerrarJuego();

                // Obtenemos la URL y el script del juego desde atributos data-route y data-script
                const url = this.dataset.route;
                const scriptJs = this.dataset.script;

                console.log("Cargando juego desde URL:", url);
                console.log("Script del juego:", scriptJs);

                // Hacemos una petición para obtener el contenido HTML del juego
                const response = await fetch(url, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest" // Identificamos como petición AJAX
                    }
                });

                const html = await response.text();

                // Ponemos el contenido del juego dentro del contenedor pantalla
                pantalla.innerHTML = html;


                // ahora sí el DOM tiene #PROVA
                if (this.dataset.juego === 'Astro' && typeof window.astroJugable === 'function') {
                    window.astroJugable();
                }


                // Revisamos si el script del juego ya está cargado para no cargarlo dos veces
                if (!document.querySelector(`script[src="${scriptJs}"]`)) {
                    // Si no está cargado, lo creamos y lo agregamos al body
                    const script = document.createElement("script");
                    script.src = scriptJs;
                    script.setAttribute("data-juego", "true");
                    
                    script.onload = async () => {
                        if (typeof window.redimensionador === "function") {
                            window.redimensionador();
                        }
                        // Ahora sí cargamos Astro si corresponde
                        switch (this.dataset.juego) {
                            case 'Astro':
                                const scriptAstro = document.createElement("script");
                                scriptAstro.src = "./js/Astro/Astro.js";
                                scriptAstro.setAttribute("data-juego", "true");
                                scriptAstro.onload = () => {
                                    console.log("Astro.js cargado, ejecutando astroJugable...");
                                    if (typeof window.astroJugable === "function") {
                                        window.astroJugable();
                                    }
                                };
                                document.body.appendChild(scriptAstro);
                                break;
                            // Aquí se pueden añadir más casos para otros juegos si necesitan inicialización
                        }
                    };

                    document.body.appendChild(script);

                    

                } else {
                    // Si ya está cargado, solo llamamos a redimensionador si existe
                    console.log("El script ya estaba cargado:", scriptJs);
                    if (typeof window.redimensionador === "function") {
                        window.redimensionador();
                    }
                }

            } catch (error) {
                // Si falla la carga del juego, mostramos un mensaje de error
                console.error("Error cargando el juego:", error);
                pantalla.innerHTML = "<p style='color:red;'>Error al cargar el juego.</p>";
            }
        });
    });




/*
Cuando la página carga, se preparan funciones para manejar los juegos activos y limpiar todo al cambiar de juego.

Se detectan todos los botones con clase .cartucho que representan los juegos disponibles.

Al hacer click en uno, se limpia todo el juego anterior y se carga el nuevo (HTML + script).

Se evita cargar scripts duplicados.

Se usa un contenedor con id pantallaJuego para mostrar el juego actual.
*/