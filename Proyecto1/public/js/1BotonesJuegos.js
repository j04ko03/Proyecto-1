document.addEventListener("DOMContentLoaded", function () {

    const btnJuego1 = document.getElementById("btnJuego1");
    const pantalla = document.getElementById("pantallaJugable");

    btnJuego1.addEventListener("click", async function (e) {
        e.preventDefault();
        console.log("CLICK!");
        try {
            const url = this.dataset.route;
            console.log("URL llamada:", url);

            const response = await fetch(url , {
                headers: {
                    "X-Requested-With": "XMLHttpRequest"
                }
            });

            const html = await response.text();

            pantalla.innerHTML = html;

        } catch (error) {
            console.error("Error cargando el juego:", error);
            pantalla.innerHTML = "<p style='color:red;'>Error al cargar el juego.</p>";
        }
    });

});