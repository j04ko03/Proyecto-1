/**
 * GESTOR DE CARTUCHOS - SISTEMA AJAX
 * Adaptado para cargar juegos via AJAX en lugar de Canvas
 */
class CartuchoManager {
    constructor() {
        this.juegoActivo = null;
        this.cartuchoActivo = null;
        this.pantalla = document.getElementById('pantallaJugable');
        this.init();
    }

    init() {
        // Los event listeners se manejan via onclick en los cartuchos
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.juegoActivo) {
                this.salirDelJuego();
            }
        });
    }
    
    /**
     * CARGA UN JUEGO DESDE UN CARTUCHO (vía AJAX)
     */
    async cargarJuegoDesdeCartucho(cartuchoElement) {
        const idJuego = cartuchoElement.dataset.cartucho;
        const nombreJuego = cartuchoElement.dataset.juego;
        const route = cartuchoElement.dataset.route;

        console.log(`🎮 Cargando juego: ${nombreJuego} desde ${route}`);

        // Resetear cartucho anterior
        if (this.cartuchoActivo) {
            this.resetearCartucho(this.cartuchoActivo);
        }

        // Animación de inserción
        await this.animarInsercionCartucho(cartuchoElement);

        // Cargar juego via AJAX
        await this.cargarJuegoAJAX(route, idJuego);

        // Actualizar estado
        this.cartuchoActivo = cartuchoElement;
        this.juegoActivo = idJuego;
    }

    async animarInsercionCartucho(cartucho) {
        return new Promise((resolve) => {
            cartucho.classList.add('cartucho-insertado');
            cartucho.style.transform = 'translateY(-15px) scale(0.98)';
            cartucho.style.transition = 'all 0.4s ease';
            
            setTimeout(() => {
                cartucho.style.transform = 'translateY(-10px) scale(1)';
                setTimeout(resolve, 200);
            }, 400);
        });
    }

    resetearCartucho(cartucho) {
        cartucho.classList.remove('cartucho-insertado');
        cartucho.style.transform = '';
        cartucho.style.transition = '';
    }

    /**
     * CARGA JUEGO VÍA AJAX (como en tu sistema actual)
     */
    async cargarJuegoAJAX(url, idJuego) {
        if (!this.pantalla) {
            console.error('❌ No se encontró el contenedor pantallaJugable');
            return;
        }

        try {
            // Mostrar loader
            this.pantalla.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #4fc3f7; font-family: 'Fira Code', monospace;">
                    <div style="text-align: center;">
                        <div style="font-size: 2em; margin-bottom: 20px;">🔄</div>
                        <div>Cargando juego...</div>
                    </div>
                </div>
            `;

            const response = await fetch(url, {
                headers: {
                    "X-Requested-With": "XMLHttpRequest"
                }
            });

            const html = await response.text();
            this.pantalla.innerHTML = html;

            // Cargar scripts específicos del juego
            await this.cargarScriptsJuego(idJuego);

            console.log(`✅ Juego ${idJuego} cargado correctamente`);

        } catch (error) {
            console.error('❌ Error cargando el juego:', error);
            this.pantalla.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #f44336; font-family: 'Fira Code', monospace;">
                    <div style="text-align: center;">
                        <div style="font-size: 2em; margin-bottom: 20px;">❌</div>
                        <div>Error al cargar el juego</div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * CARGA SCRIPTS ESPECÍFICOS DEL JUEGO
     */
    async cargarScriptsJuego(idJuego) {
        const scriptsMap = {
            1: { // ASTRO
                main: window.rutaScripts?.astro,
                inicializador: window.rutaScripts?.astroInicializador
            }
            // Agregar más juegos aquí según necesites
        };

        const scripts = scriptsMap[idJuego];
        if (!scripts) return;

        // Cargar script principal
        if (scripts.main) {
            await this.cargarScript(scripts.main);
        }

        // Cargar inicializador
        if (scripts.inicializador) {
            await this.cargarScript(scripts.inicializador, () => {
                if (typeof inicializadorAstro === 'function') {
                    inicializadorAstro();
                }
            });
        }
    }

    cargarScript(src, onloadCallback = null) {
        return new Promise((resolve, reject) => {
            // Evitar cargar el mismo script múltiples veces
            if (document.querySelector(`script[src="${src}"]`)) {
                if (onloadCallback) onloadCallback();
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                if (onloadCallback) onloadCallback();
                resolve();
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    salirDelJuego() {
        if (this.juegoActivo) {
            console.log('👋 Saliendo del juego');

            // Limpiar pantalla
            if (this.pantalla) {
                this.pantalla.innerHTML = `
                    <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #bdc3c7; font-family: 'Fira Code', monospace;">
                        <div style="text-align: center;">
                            <div style="font-size: 2em; margin-bottom: 20px;">🎮</div>
                            <div>Selecciona un juego para comenzar</div>
                        </div>
                    </div>
                `;
            }

            // Resetear cartucho
            if (this.cartuchoActivo) {
                this.resetearCartucho(this.cartuchoActivo);
            }

            // Limpiar estado
            this.juegoActivo = null;
            this.cartuchoActivo = null;
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    window.cartuchoManager = new CartuchoManager();
});

// Función global para usar desde onclick de cartuchos
window.cargarJuegoDesdeCartucho = function(cartuchoElement) {
    if (window.cartuchoManager) {
        window.cartuchoManager.cargarJuegoDesdeCartucho(cartuchoElement);
    }
};

// Función de compatibilidad (opcional)
window.cargarJuego = function(idJuego) {
    const cartucho = document.querySelector(`[data-cartucho="${idJuego}"]`);
    if (cartucho && window.cartuchoManager) {
        window.cartuchoManager.cargarJuegoDesdeCartucho(cartucho);
    }
};