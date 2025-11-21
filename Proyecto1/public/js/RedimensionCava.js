function redimensionarCanva(){
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error("❌ Astro: No se encontró el canvas");
        return;
    }

    const contenedorCanvas = document.getElementById('contenedorCanvas');
    canvas.width = contenedorCanvas.clientWidth;   
    canvas.height = contenedorCanvas.clientHeight; 
    canvas.style = "border: 1px solid red";

    //Ajustar tamaño del canva en caso de una redimensión de ventana
    function ajustarCanvas() {
        canvas.width = contenedorCanvas.clientWidth;
        canvas.height = contenedorCanvas.clientHeight;
        console.log('Redimensionando...');
    }
    // Carga inicial del tamaño
    ajustarCanvas();

    window.addEventListener('resize', ajustarCanvas);
}

// 🚀 REGISTRA EL INICIALIZADOR DE MANERA GLOBAL
window.redimensionador = redimensionarCanva;