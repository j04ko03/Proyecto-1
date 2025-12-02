class ConsolaResizeManager {
    constructor() {
        this.canvas = null;
        this.container = document.getElementById('pantallaJuego');
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.aspectRatio = 0;
        this.resizeTimeout = null;
        
        this.init();
    }
    
    init() {
        console.log('ConsolaResizeManager inicializado');
        
        // Escuchar cuando se carga un canvas
        this.setupCanvasObserver();
        
        // Escuchar redimensionamiento
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => this.handleResize());
    }
    
    setupCanvasObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.tagName === 'CANVAS') {
                            this.setCanvas(node);
                        } else if (node.querySelector && node.querySelector('canvas')) {
                            const canvas = node.querySelector('canvas');
                            if (canvas) this.setCanvas(canvas);
                        }
                    });
                }
            });
        });
        
        observer.observe(this.container, { childList: true, subtree: true });
    }
    
    setCanvas(canvasElement) {
        this.canvas = canvasElement;
        
        // Guardar dimensiones originales del canvas
        this.originalWidth = canvasElement.width || 900; // Default si no tiene
        this.originalHeight = canvasElement.height || 380; // Default si no tiene
        this.aspectRatio = this.originalWidth / this.originalHeight;
        
        // Añadir clase para CSS
        canvasElement.classList.add('canvas-consola');
        
        // Ocultar estado de carga si existe
        const estadoCarga = this.container.querySelector('.estado-carga');
        if (estadoCarga) {
            estadoCarga.style.display = 'none';
        }
        
        // Ajustar tamaño inicial
        this.resizeCanvas();
        
        console.log(`Canvas configurado: ${this.originalWidth}x${this.originalHeight}`);
    }
    
    handleResize() {
        // Debounce para mejor rendimiento
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.resizeCanvas();
        }, 100);
    }
    
    resizeCanvas() {
        if (!this.canvas || !this.container) return;
        
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;
        
        let newWidth, newHeight;
        
        // Calcular nuevas dimensiones manteniendo relación de aspecto
        if (containerWidth / containerHeight > this.aspectRatio) {
            // Contenedor es más ancho
            newHeight = containerHeight;
            newWidth = newHeight * this.aspectRatio;
        } else {
            // Contenedor es más alto
            newWidth = containerWidth;
            newHeight = newWidth / this.aspectRatio;
        }
        
        // Aplicar nuevas dimensiones (solo estilo, no cambia el canvas interno)
        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;
        
        // Centrar en el contenedor
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '50%';
        this.canvas.style.top = '50%';
        this.canvas.style.transform = 'translate(-50%, -50%)';
        
        // Emitir evento para que tu compañero pueda ajustar el juego si lo necesita
        this.dispatchResizeEvent(newWidth, newHeight);
        
        console.log(`Canvas redimensionado a: ${Math.round(newWidth)}x${Math.round(newHeight)}`);
    }
    
    dispatchResizeEvent(width, height) {
        // Emitir evento personalizado para que otros scripts lo capturen
        const event = new CustomEvent('canvasResized', {
            detail: {
                width: width,
                height: height,
                originalWidth: this.originalWidth,
                originalHeight: this.originalHeight
            }
        });
        window.dispatchEvent(event);
    }
    
    // Método público para forzar redimensionamiento
    forceResize() {
        this.resizeCanvas();
    }
    
    // Método para obtener información
    getCanvasInfo() {
        return {
            container: {
                width: this.container.clientWidth,
                height: this.container.clientHeight
            },
            canvas: {
                original: { width: this.originalWidth, height: this.originalHeight },
                current: {
                    styleWidth: this.canvas ? this.canvas.style.width : 'N/A',
                    styleHeight: this.canvas ? this.canvas.style.height : 'N/A',
                    clientWidth: this.canvas ? this.canvas.clientWidth : 'N/A',
                    clientHeight: this.canvas ? this.canvas.clientHeight : 'N/A'
                },
                aspectRatio: this.aspectRatio
            }
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.consolaResizeManager = new ConsolaResizeManager();
    
    // También redimensionar cuando se cargue completamente la ventana
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (window.consolaResizeManager) {
                window.consolaResizeManager.forceResize();
            }
        }, 300);
    });
});