function inicializadorAstro(){
    const canvas = document.getElementById('canvas');
    const contenedorCanvas = document.getElementById('contenedorCanvas');

    canvas.width = contenedorCanvas.clientWidth;   
    canvas.height = contenedorCanvas.clientHeight; 
    canvas.style = "border: 1px solid red";

    //Ajustar tamaño del canva en caso de una redimensión de ventana
    function ajustarCanvas() {
        canvas.width = contenedorCanvas.clientWidth;
        canvas.height = contenedorCanvas.clientHeight;
        console.log('Redimensionando...');
        // Opcional: volver a dibujar todo lo dibujado hasta el momento
        // dibujar(); 
    }

    // Carga inicial del tamaño
    ajustarCanvas();

    // Al redimensionar la ventana
    window.addEventListener('resize', ajustarCanvas);
}