document.addEventListener("DOMContentLoaded", function () {

    //--------------------------------------------------------------
    // SISTEMA GLOBAL PARA CONTROLAR Y CERRAR EL JUEGO ANTERIOR
    //--------------------------------------------------------------
    window.juegoActivo = {
        intervals: [],
        timeouts: [],
        listeners: [],
        cleanup: []
    };

    // Registra intervalos para poder detenerlos
    window.registrarInterval = function (id) {
        juegoActivo.intervals.push(id);
    };

    window.registrarTimeout = function (id) {
        juegoActivo.timeouts.push(id);
    };

    window.registrarCleanup = function (fn) {
        juegoActivo.cleanup.push(fn);
    };
    // Función central de cierre REAL del juego
    window.cerrarJuego = function () {

        console.log("---------------------------------------------------------CERRANDO JUEGO ANTERIOR...-----------------------------------------------------------");

        // Limpiar intervals
        juegoActivo.intervals.forEach(id => clearInterval(id));
        juegoActivo.intervals = [];

        // Limpiar timeouts
        juegoActivo.timeouts.forEach(id => clearTimeout(id));
        juegoActivo.timeouts = [];

        // Cleanup personalizados
        juegoActivo.cleanup.forEach(fn => fn());
        juegoActivo.cleanup = [];

        // Listeners
        juegoActivo.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        juegoActivo.listeners = [];

        // NUEVO: Eliminar TODOS los scripts de juegos cargados
        document.querySelectorAll("script[data-juego]").forEach(s => s.remove());

        // Limpiar pantalla
        const pantalla = document.getElementById("pantallaJugable");
        if (pantalla) pantalla.innerHTML = "";

        console.log("Juego cerrado completamente");
    };

    // Para registrar listeners desde los juegos:
    window.registrarListener = function (element, event, handler) {
        element.addEventListener(event, handler);
        juegoActivo.listeners.push({ element, event, handler });
    };



    const pantalla = document.getElementById("pantallaJuego");

    const cartucho = document.querySelectorAll('.cartucho');

    console.log(cartucho);

    cartucho.forEach(element => {
        element.addEventListener("click", async function (e) {
            e.preventDefault();


            console.log("CLICK cartucho: ", this.dataset.juego);
            console.log("---------------------------------------------------");

            try {
                cerrarJuego();

                // Obtiene la ruta del juego desde el atributo data-route del botón
                const url = this.dataset.route; // "this" hace referencia al botón clicado
                console.log("URL llamada:", url);
                const scriptJs = this.dataset.script;
                console.log(scriptJs + "-------------------------------------------");

                // Crear un AbortController
                const controller = new AbortController();
                const signal = controller.signal;

                // Realiza una petición HTTP a la ruta del juego usando fetch
                // El header "X-Requested-With" indica que es una petición AJAX
                const response = await fetch(url, {
                    headers: {
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    signal
                });
                // Convierte la respuesta a texto (HTML)
                const html = await response.text();
                console.log(html + "<----------");
                pantalla.innerHTML = html;
                // Cargar el script manualmente
                console.log('Que script carga?? ' + url.split('/').pop());
                if (!document.querySelector(`script[src="${scriptJs}"]`)) {
                    console.log("-------------------------- No entra en el abort --------------------------");
                    
                    let script = document.createElement("script");

                    console.log(script);
                    script.src = scriptJs;
                    //script.type = "text/javascript";
                    script.setAttribute("data-juego", "true");
                    console.log(script);
                        
                    document.body.appendChild(script);
                } else {
                    console.log("⚠️ Script ya existe, NO se vuelve a cargar:", scriptJs);

                    if (typeof window.inicializarJuego === "function") {
                        window.inicializarJuego();
                    }
                }



            } catch (error) {
                console.error("Error cargando el juego:", error);
                pantalla.innerHTML = "<p style='color:red;'>Error al cargar el juego.</p>";
            }

        })

    });
});