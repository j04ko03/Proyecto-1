document.addEventListener("DOMContentLoaded", function () {
    const registro = document.querySelector(".btn-register");

    const loginS = new Audio("/Proyecto-1/Proyecto1/Astro/loginS.mp3");
    loginS.loop = true;

    // ¿El usuario ya interactuó en login?
    const audioPermitido = sessionStorage.getItem("audio-ok");

    if (audioPermitido === "true") {
        // Intentar reproducir automáticamente
        loginS.play().catch(() => {
            // Si falla (Chrome a veces bloquea), pedir un clic mínimo
            const desbloquear = () => {
                loginS.play();
                document.removeEventListener("click", desbloquear);
            };
            document.addEventListener("click", desbloquear);
        });
    }

    registro.addEventListener("click", () => {
        loginS.pause();
        loginS.currentTime = 0;
        // Guardar en sessionStorage que el usuario ya interactuó
        sessionStorage.setItem("audio-ok", "true");
});
});