function inicializadorCapiMates(){
    //Intento cargar foto de la parte trasera
    const contenedorBack = document.getElementById('contenedorJuego');
    if (contenedorBack) {
        // Coge la ruta relativa del data-attribute
        contenedorBack.style.backgroundImage = "url('/Proyecto-1/Proyecto1/Astro/planetaAstro.jpg')";
        contenedorBack.style.backgroundSize = "cover";
        contenedorBack.style.backgroundPosition = "center";
    }

    //Modificar Ocupación del Canvas
    const canvas = document.getElementById('canvas');
    const contenedorCanvas = document.getElementById('contenedorCanvas');

    canvas.width = contenedorCanvas.clientWidth;   
    canvas.height = contenedorCanvas.clientHeight; 
    canvas.style = "border: 1px solid red";

    const ctx = canvas.getContext('2d');


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
