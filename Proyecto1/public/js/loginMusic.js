document.addEventListener("DOMContentLoaded", function () {

const iniciar = document.querySelector(".btn-login");
const registro = document.querySelector(".btn-re");

const loginS = new Audio("/Proyecto-1/Proyecto1/Astro/loginS.mp3");
loginS.play();
loginS.loop = true;
const homeS = new Audio("/Proyecto-1/Proyecto1/Astro/homeS.mp3");


// Espera cualquier interacción mínima
    const unlockAudio = () => {
        loginS.play().then(() => {
            document.removeEventListener("click", unlockAudio);
        }).catch(() => {});
    };

    document.addEventListener("click", unlockAudio);

    

iniciar.addEventListener("click", () => {
        loginS.pause();
        loginS.currentTime = 0;
        // Guardar en sessionStorage que el usuario ya interactuó
        sessionStorage.setItem("audio-ok", "true");
});

registro.addEventListener("click", () => {
        loginS.pause();
        loginS.currentTime = 0;
        // Guardar en sessionStorage que el usuario ya interactuó
        sessionStorage.setItem("audio-ok", "true");
});

});