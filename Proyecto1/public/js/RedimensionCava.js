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
        //canvas.width = contenedorCanvas.clientWidth;
        //canvas.height = contenedorCanvas.clientHeight;
        /*canvas.style.width = '100%';
        canvas.style.height = '100%';*/
        console.log('Redimensionando...');

        // 🔥 Emitimos un evento indicando que cambió el tamaño
        window.dispatchEvent(
            new CustomEvent('contenedorResize', {
                detail: {
                    width: contenedorCanvas.clientWidth,
                    height: contenedorCanvas.clientHeight
                }
            })
        );

    }
    // Carga inicial del tamaño
    ajustarCanvas();

    window.addEventListener('resize', ajustarCanvas);
}

// 🚀 REGISTRA EL INICIALIZADOR DE MANERA GLOBAL
window.redimensionador = redimensionarCanva;