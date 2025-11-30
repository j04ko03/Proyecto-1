document.addEventListener("DOMContentLoaded", function () {

    window.homeS = new Audio("/Proyecto-1/Proyecto1/Astro/homeS.mp3");
    homeS.loop = true;
    homeS.volume = 0.3;

    // ¿El usuario ya interactuó en login?
    const audioPermitido = sessionStorage.getItem("audio-ok");

    if (audioPermitido === "true") {
        // Intentar reproducir automáticamente
        homeS.play().catch(() => {
            // Si falla (Chrome a veces bloquea), pedir un clic mínimo
            const desbloquear = () => {
                homeS.play();
                document.removeEventListener("click", desbloquear);
            };
            document.addEventListener("click", desbloquear);
        });
    }
});