class ConsolaResizeManager {
    constructor() {
        this.consola = document.querySelector('.consola');
        this.pantalla = document.getElementById('pantallaJuego');
        
        if (!this.consola || !this.pantalla) return;
        
        this.init();
    }
    
    init() {
        console.log('Sistema de resize de consola activado');
        
        // Redimensionar al cargar
        this.handleResize();
        
        // Escuchar cambios
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => this.handleResize());
        
        // También redimensionar cuando se cargue un canvas
        this.observeCanvas();
    }
    
    handleResize() {
        // Para ajustar toda la consola automáticamente
        this.adjustConsola();
        this.adjustControls();
        this.adjustPantalla();
    }
    
    adjustConsola() {
        // La consola ya es responsive con CSS
        // Este método podría ajustar detalles adicionales si los necesitas
        console.log(`📏 Consola: ${this.consola.offsetWidth}px`);
    }
    
    adjustControls() {
        // Los controles se ajustan automáticamente con CSS
        // Puedes añadir lógica específica aquí si necesitas
    }
    
    adjustPantalla() {
        // La pantalla se ajusta automáticamente con CSS
        // El canvas dentro se escalará visualmente
    }
    
    observeCanvas() {
        // Solo para asegurar que el canvas ocupe toda la pantalla
        const observer = new MutationObserver(() => {
            const canvas = this.pantalla.querySelector('canvas');
            if (canvas) {
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.objectFit = 'contain';
            }
        });
        
        observer.observe(this.pantalla, { childList: true });
    }
}