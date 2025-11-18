document.addEventListener("DOMContentLoaded", function () {

    const btnJuego1 = document.getElementById("btnJuego1");
    const pantalla = document.getElementById("pantallaJugable");

    // Agrega un listener para el evento 'click' a cada botón
    btnJuego1.addEventListener("click", async function (e) {
        // Evita que el enlace haga su acción por defecto (navegar a #)
        e.preventDefault();
        console.log("CLICK!");
        console.log("---------------------------------------------------");

        try {
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
            const response = await fetch(url , {
                headers: {
                    "X-Requested-With": "XMLHttpRequest"
                },
                signal
            });
            // Convierte la respuesta a texto (HTML)
            const html = await response.text();
            console.log(html);
            pantalla.innerHTML = html;
            // Cargar el script manualmente
            console.log('Que script carga?? ' + url.split('/').pop());
            if (!document.querySelector(`script[src="${scriptJs}"]`)) {
                console.log("-------------------------- No entra en el abort --------------------------");
                let script = document.createElement("script");
                script.src = scriptJs;
                script.type = "text/javascript";
                document.body.appendChild(script);
                console.log("-------------------------- No entra en el abort --------------------------");
            } else {
                controller.abort();
                console.log("-------------------------- Se ha detenido el script con el abort --------------------------");
            }

            

        } catch (error) {
            console.error("Error cargando el juego:", error);
            pantalla.innerHTML = "<p style='color:red;'>Error al cargar el juego.</p>";
        }
    });

});