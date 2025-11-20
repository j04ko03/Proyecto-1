/**
 * GESTOR DE CARTUCHOS - SISTEMA AJAX OPTIMIZADO
 * Maneja carga de juegos via AJAX con control de peticiones y abort
 */
class CartuchoManager {
    constructor() {
        this.juegoActivo = null;
        this.cartuchoActivo = null;
        this.pantalla = document.getElementById('pantallaJugable');
        this.scriptsCargados = new Set(); // Cache de scripts
        this.cargando = false; // Bloqueo durante carga
        this.controller = null; // AbortController para peticiones
        this.init();
    }

    /**
     * INICIALIZACIÓN DEL SISTEMA
     */
    init() {
        console.log('🎮 CartuchoManager inicializado');
        
        // Event listener global para tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.juegoActivo) {
                this.salirDelJuego();
            }
        });

        // Delegación de eventos para todos los cartuchos
        document.addEventListener('click', (e) => {
            const cartucho = e.target.closest('[data-cartucho]');
            if (cartucho) {
                this.cargarJuegoDesdeCartucho(cartucho);
            }
        });

        // Accesibilidad - teclado
        document.addEventListener('keydown', (e) => {
            const cartucho = e.target.closest('[data-cartucho]');
            if (cartucho && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.cargarJuegoDesdeCartucho(cartucho);
            }
        });
    }

    /**
     * CARGA UN JUEGO DESDE UN CARTUCHO
     */
    async cargarJuegoDesdeCartucho(cartuchoElement) {
        const idJuego = cartuchoElement.dataset.cartucho;
        const nombreJuego = cartuchoElement.dataset.juego;
        const route = cartuchoElement.dataset.route;
        const scriptJs = cartuchoElement.dataset.script;

        // 🔒 EVITAR MÚLTIPLES CLICKS DURANTE CARGA
        if (this.cargando) {
            console.log('⏳ Ya se está cargando un juego, espera...');
            this.mostrarToast('Ya se está cargando un juego...', 'warning');
            return;
        }

        // 🔒 EVITAR RECARGAR EL MISMO JUEGO
        if (this.juegoActivo === idJuego && cartuchoElement.classList.contains('cartucho-insertado')) {
            console.log('⚠️ Este juego ya está cargado y activo');
            this.mostrarToast('Este juego ya está cargado', 'info');
            return;
        }

        console.log(`🎮 Cargando: ${nombreJuego}`);
        console.log(`📁 Script: ${scriptJs}`);

        // 🎯 ABORTAR PETICIÓN ANTERIOR SI EXISTE
        if (this.controller) {
            this.controller.abort();
            console.log('🛑 Petición anterior cancelada');
        }

        // 🔒 ACTIVAR BLOQUEO
        this.cargando = true;
        this.deshabilitarCartuchos();

        try {
            // 🎯 NUEVO ABORTCONTROLLER PARA ESTA PETICIÓN
            this.controller = new AbortController();
            
            // Resetear cartucho anterior
            this.resetearCartuchoAnterior();

            // Animación de inserción
            await this.animarInsercionCartucho(cartuchoElement);

            // Cargar juego via AJAX
            await this.cargarJuegoAJAX(route, idJuego, nombreJuego, scriptJs);

            // Actualizar estado
            this.cartuchoActivo = cartuchoElement;
            this.juegoActivo = idJuego;

            this.mostrarToast(`${nombreJuego} cargado correctamente`, 'success');

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('✅ Petición cancelada correctamente');
            } else {
                console.error('❌ Error cargando el juego:', error);
                this.mostrarError(error);
                this.mostrarToast('Error al cargar el juego', 'error');
            }
        } finally {
            // 🔓 QUITAR BLOQUEO (siempre se ejecuta)
            this.cargando = false;
            this.habilitarCartuchos();
        }
    }

    /**
     * ANIMACIÓN DE INSERCIÓN DEL CARTUCHO
     */
    async animarInsercionCartucho(cartucho) {
        return new Promise((resolve) => {
            cartucho.classList.add('cartucho-insertado');
            cartucho.style.transform = 'translateY(-8px) scale(0.95)';
            cartucho.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
                cartucho.style.transform = 'translateY(-4px) scale(0.98)';
                setTimeout(resolve, 150);
            }, 300);
        });
    }

    /**
     * RESETEA EL CARTUCHO ANTERIOR
     */
    resetearCartuchoAnterior() {
        if (this.cartuchoActivo) {
            this.cartuchoActivo.classList.remove('cartucho-insertado');
            this.cartuchoActivo.style.transform = '';
            this.cartuchoActivo.style.transition = '';
        }
        
        // También remover de cualquier otro cartucho activo
        document.querySelectorAll('.cartucho-insertado').forEach(cartucho => {
            cartucho.classList.remove('cartucho-insertado');
            cartucho.style.transform = '';
            cartucho.style.transition = '';
        });
    }

    /**
     * CARGA EL JUEGO VÍA AJAX
     */
    async cargarJuegoAJAX(url, idJuego, nombreJuego, scriptJs) {
        if (!this.pantalla) {
            throw new Error('No se encontró #pantallaJugable');
        }

        try {
            // Mostrar loader
            this.mostrarLoader(nombreJuego);

            // 🎯 PETICIÓN FETCH CON ABORTCONTROLLER
            const response = await fetch(url, {
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Accept": "text/html"
                },
                signal: this.controller.signal // VINCULAR SEÑAL DE ABORTO
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            const html = await response.text();
            this.pantalla.innerHTML = html;

            // Cargar scripts específicos del juego
            if (scriptJs) {
                await this.cargarScriptJuego(scriptJs);
            } else {
                // Sistema alternativo por ID de juego
                await this.cargarScriptsPorIdJuego(idJuego);
            }

            console.log(`✅ ${nombreJuego} cargado correctamente`);

        } catch (error) {
            // No relanzar AbortError, es normal cuando se cancela
            if (error.name !== 'AbortError') {
                throw error;
            }
        }
    }

    /**
     * CARGA SCRIPTS POR RUTA DIRECTA (desde data-script)
     */
    async cargarScriptJuego(scriptJs) {
        console.log(`📜 Verificando script: ${scriptJs}`);
        
        // Verificar si el script YA está en cache
        if (this.scriptsCargados.has(scriptJs)) {
            console.log('✅ Script ya cargado (en cache), reutilizando...');
            return;
        }

        // Verificar si el script YA está en el DOM
        if (document.querySelector(`script[src="${scriptJs}"]`)) {
            console.log('✅ Script ya en DOM, agregando a cache...');
            this.scriptsCargados.add(scriptJs);
            return;
        }

        console.log('📥 Cargando nuevo script...');
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptJs;
            script.type = "text/javascript";

            script.onload = () => {
                this.scriptsCargados.add(scriptJs);
                console.log(`✅ Script cargado: ${scriptJs}`);
                resolve();
            };

            script.onerror = () => {
                console.error(`❌ Error cargando script: ${scriptJs}`);
                reject(new Error(`Failed to load script: ${scriptJs}`));
            };

            document.body.appendChild(script);
        });
    }

    /**
     * CARGA SCRIPTS POR ID DE JUEGO (sistema alternativo)
     */
    async cargarScriptsPorIdJuego(idJuego) {
        const scriptsMap = {
            1: { // ASTRO
                main: window.rutaScripts?.astro,
                inicializador: window.rutaScripts?.astroInicializador
            }
            // Agregar más juegos aquí según necesites
            // 2: { main: 'ruta/juego2.js', inicializador: 'ruta/inicializador2.js' }
        };

        const scripts = scriptsMap[idJuego];
        if (!scripts) {
            console.warn(`⚠️ No hay scripts definidos para el juego ${idJuego}`);
            return;
        }

        // Cargar script principal
        if (scripts.main) {
            await this.cargarScriptJuego(scripts.main);
        }

        // Cargar inicializador
        if (scripts.inicializador) {
            await this.cargarScriptJuego(scripts.inicializador);
        }

        // Ejecutar inicializador específico del juego
        this.ejecutarInicializador(idJuego);
    }

    /**
     * EJECUTA EL INICIALIZADOR ESPECÍFICO DEL JUEGO
     */
    ejecutarInicializador(idJuego) {
        switch (idJuego) {
            case 1: // ASTRO
                if (typeof inicializadorAstro === 'function') {
                    inicializadorAstro();
                    console.log('✅ Inicializador Astro ejecutado');
                }
                break;
            // Agregar más casos para otros juegos
            default:
                console.warn(`⚠️ No hay inicializador definido para el juego ${idJuego}`);
        }
    }

    /**
     * 🔒 DESHABILITAR CARTUCHOS DURANTE CARGA
     */
    deshabilitarCartuchos() {
        document.querySelectorAll('[data-cartucho]').forEach(cartucho => {
            cartucho.classList.add('cartucho-bloqueado');
            cartucho.setAttribute('aria-busy', 'true');
        });
    }

    /**
     * 🔓 HABILITAR CARTUCHOS
     */
    habilitarCartuchos() {
        document.querySelectorAll('[data-cartucho]').forEach(cartucho => {
            cartucho.classList.remove('cartucho-bloqueado');
            cartucho.removeAttribute('aria-busy');
        });
    }

    /**
     * MUESTRA EL LOADER DE CARGA
     */
    mostrarLoader(nombreJuego) {
        this.pantalla.innerHTML = `
            <div class="pantalla-loader">
                <div class="loader-contenido">
                    <div class="loader-icon">🔄</div>
                    <div class="loader-text">Cargando ${nombreJuego}...</div>
                    <div class="loader-subtext">Preparando la diversión</div>
                    <div class="loader-progress"></div>
                </div>
            </div>
        `;
    }

    /**
     * MUESTRA ERROR EN PANTALLA
     */
    mostrarError(error) {
        this.pantalla.innerHTML = `
            <div class="pantalla-error">
                <div class="error-contenido">
                    <div class="error-icon">❌</div>
                    <div class="error-text">Error al cargar el juego</div>
                    <div class="error-subtext">${error.message}</div>
                    <button onclick="window.cartuchoManager.salirDelJuego()" class="error-btn">
                        Volver al menú
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * MUESTRA TOAST DE NOTIFICACIÓN
     */
    mostrarToast(mensaje, tipo = 'info') {
        // Crear toast si no existe
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        const tipoColores = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };

        toast.style.cssText = `
            background: ${tipoColores[tipo] || '#2196f3'};
            color: white;
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
        `;
        
        toast.textContent = mensaje;
        toast.onclick = () => toast.remove();

        toastContainer.appendChild(toast);

        // Auto-remover después de 4 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    /**
     * SALE DEL JUEGO ACTUAL
     */
    salirDelJuego() {
        if (this.juegoActivo) {
            console.log('👋 Saliendo del juego actual');

            // 🎯 Cancelar cualquier petición en curso
            if (this.controller) {
                this.controller.abort();
            }

            // Limpiar pantalla
            if (this.pantalla) {
                this.pantalla.innerHTML = `
                    <div class="pantalla-inicio">
                        <div class="inicio-contenido">
                            <div class="inicio-icon">🎮</div>
                            <div class="inicio-text">Selecciona un cartucho</div>
                            <div class="inicio-subtext">para comenzar a jugar</div>
                        </div>
                    </div>
                `;
            }

            // Resetear cartucho
            this.resetearCartuchoAnterior();

            // Limpiar estado (pero mantener scripts en cache)
            this.juegoActivo = null;
            this.cartuchoActivo = null;

            console.log('✅ Volviendo al menú principal');
        }
    }

    /**
     * LIMPIA CACHE DE SCRIPTS (opcional)
     */
    limpiarCache() {
        this.scriptsCargados.clear();
        console.log('🧹 Cache de scripts limpiado');
        this.mostrarToast('Cache limpiado', 'info');
    }
}

// Inicialización automática cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
    window.cartuchoManager = new CartuchoManager();
    console.log('🚀 Sistema de cartuchos listo');
});

// Función global para compatibilidad con onclick en HTML
window.cargarJuegoDesdeCartucho = function(cartuchoElement) {
    if (window.cartuchoManager) {
        window.cartuchoManager.cargarJuegoDesdeCartucho(cartuchoElement);
    }
};

// Función global para salir del juego
window.salirDelJuego = function() {
    if (window.cartuchoManager) {
        window.cartuchoManager.salirDelJuego();
    }
};