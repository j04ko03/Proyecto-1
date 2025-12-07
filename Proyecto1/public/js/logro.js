function mostrarLogro(nombreLogro) {
    const contenedor = document.getElementById("logro-toast-contenedor");

    const toast = document.createElement("div");
    toast.classList.add("logro-toast");

    toast.innerHTML = `
        🏆 <span>${nombreLogro}</span>
    `;

    contenedor.appendChild(toast);

    // Eliminar después de animación
    setTimeout(() => {
        toast.remove();
    }, 4500);
}