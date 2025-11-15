class CartuchoManager {
    constructor() {
        this.juegoActivo = null;
        this.cartuchoActivo = null;
        this.estado = {
            juegoCargado: false,
            cartuchoInsertado: false,
            pantallaActiva: false
        };
        this.init();
    }

    init() {
        document.addEventListener('click', (e) => {
            const cartucho = e.target.closest('.cartucho');
            if (cartucho) {
                this.seleccionarCartucho(cartucho);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.juegoActivo) {
                this.salirDelJuego();
            }
        });
    }

    async seleccionarCartucho(cartuchoElement) {
        const idJuego = cartuchoElement.dataset.cartucho;
        const nombreJuego = cartuchoElement.dataset.juego;

        console.log(`🎮 Cartucho seleccionado: ${nombreJuego} (ID: ${idJuego})`);

        if (this.cartuchoActivo) {
            this.resetearCartucho(this.cartuchoActivo);
        }

        await this.animarInsercionCartucho(cartuchoElement);
        await this.inicializarJuego(idJuego, nombreJuego);

        this.cartuchoActivo = cartuchoElement;
        this.juegoActivo = idJuego;
    }

    async animarInsercionCartucho(cartucho) {
        return new Promise((resolve) => {
            cartucho.classList.add('cartucho-insertado');
            cartucho.style.transform = 'translateY(-50px) scale(0.95)';
            cartucho.style.transition = 'all 0.5s ease';
            cartucho.style.zIndex = '10';
            cartucho.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5)';

            setTimeout(() => {
                cartucho.style.transform = 'translateY(-30px) scale(1)';
                setTimeout(resolve, 300);
            }, 500);
        });
    }

    resetearCartucho(cartucho) {
        cartucho.classList.remove('cartucho-insertado');
        cartucho.style.transform = '';
        cartucho.style.transition = '';
        cartucho.style.zIndex = '';
        cartucho.style.boxShadow = '';
    }

    async inicializarJuego(idJuego, nombreJuego) {
        console.log(`🕹️ Inicializando juego: ${nombreJuego}`);

        this.mostrarLoader();

        if (window.juegoActivo) {
            window.juegoActivo.detener();
        }

        try {
            await this.cargarScriptJuego(idJuego);
            
            switch(parseInt(idJuego)) {
                case 1:
                    if (typeof window.iniciarAstro === 'function') {
                        window.juegoActivo = window.iniciarAstro();
                    }
                    break;
                case 2:
                    if (typeof window.iniciarCarreras === 'function') {
                        window.juegoActivo = window.iniciarCarreras();
                    }
                    break;
                case 3:
                    if (typeof window.iniciarAventura === 'function') {
                        window.juegoActivo = window.iniciarAventura();
                    }
                    break;
                case 4:
                    if (typeof window.iniciarZombie === 'function') {
                        window.juegoActivo = window.iniciarZombie();
                    }
                    break;
                default:
                    throw new Error('Juego no encontrado');
            }

            this.estado.juegoCargado = true;
            this.estado.pantallaActiva = true;

        } catch (error) {
            console.error('❌ Error cargando juego:', error);
            this.mostrarMensajeError();
        }
    }

    async cargarScriptJuego(idJuego) {
        const rutas = {
            1: 'assets/js/scriptJuegos/astro.js',
            2: 'assets/js/scriptJuegos/carreras.js',
            3: 'assets/js/scriptJuegos/aventura.js',
            4: 'assets/js/scriptJuegos/zombie.js'
        };

        const ruta = rutas[idJuego];
        if (!ruta) throw new Error(`Ruta no encontrada para juego ${idJuego}`);

        if (document.querySelector(`script[src="${ruta}"]`)) {
            return;
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = ruta;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Error cargando ${ruta}`));
            document.head.appendChild(script);
        });
    }

    mostrarLoader() {
        const canvas = document.getElementById('pantallaJuego');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#3498db';
        ctx.font = '20px Arial';
        ctx.fillText('🔄 Cargando juego...', 50, 100);
    }

    mostrarMensajeError() {
        const canvas = document.getElementById('pantallaJuego');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e74c3c';
        ctx.font = '20px Arial';
        ctx.fillText('❌ Error: Juego no disponible', 50, 100);
    }

    salirDelJuego() {
        if (this.juegoActivo) {
            console.log('👋 Saliendo del juego');

            if (window.juegoActivo) {
                window.juegoActivo.detener();
            }
            
            if (this.cartuchoActivo) {
                this.resetearCartucho(this.cartuchoActivo);
            }
            
            this.juegoActivo = null;
            this.cartuchoActivo = null;
            window.juegoActivo = null;
            this.estado.juegoCargado = false;
            this.estado.pantallaActiva = false;

            const canvas = document.getElementById('pantallaJuego');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cartuchoManager = new CartuchoManager();
});

window.cargarJuego = function(idJuego) {
    const cartucho = document.querySelector(`[data-cartucho="${idJuego}"]`);
    if (cartucho && window.cartuchoManager) {
        window.cartuchoManager.seleccionarCartucho(cartucho);
    }
};

function iniciarAstro() {
    const canvas = document.getElementById('pantallaJuego');
    const ctx = canvas.getContext('2d');
    
    // METER ENLACE DE JS DE LA LOGICA DEL JUEGO ASTRO 
}

window.iniciarAstro = iniciarAstro;
