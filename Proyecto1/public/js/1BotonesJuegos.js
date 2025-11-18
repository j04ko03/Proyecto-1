document.addEventListener("DOMContentLoaded", function () {

    const btnJuego1 = document.getElementById("btnJuego1");
    const pantalla = document.getElementById("pantallaJugable");

    // Agrega un listener para el evento 'click' a cada botón
    btnJuego1.addEventListener("click", async function (e) {
        // Evita que el enlace haga su acción por defecto (navegar a #)
        e.preventDefault();
        console.log("CLICK!");

        try {
            // Obtiene la ruta del juego desde el atributo data-route del botón
            const url = this.dataset.route; // "this" hace referencia al botón clicado
            console.log("URL llamada:", url);
            const scriptJs = this.dataset.script;
            // Realiza una petición HTTP a la ruta del juego usando fetch
            // El header "X-Requested-With" indica que es una petición AJAX
            const response = await fetch(url , {
                headers: {
                    "X-Requested-With": "XMLHttpRequest"
                }
            });
            // Convierte la respuesta a texto (HTML)
            const html = await response.text();
            console.log(html);
            pantalla.innerHTML = html;
            // Cargar el script manualmente
            console.log('Que script carga?? ' + url.split('/').pop());
            if (!document.querySelector(`script[src="${scriptJs}"]`)) {
                let script = document.createElement("script");
                script.src = scriptJs;
                script.type = "text/javascript";
                document.body.appendChild(script);
            } else {
                console.log("Script ya cargado, no se vuelve a añadir");
            }

            

        } catch (error) {
            console.error("Error cargando el juego:", error);
            pantalla.innerHTML = "<p style='color:red;'>Error al cargar el juego.</p>";
        }
    });

});