<div class="cartucho cartucho-{{ $cartucho->id }}" 
     data-cartucho="{{ $cartucho->id }}"
     data-juego="{{ $cartucho->nombre }}"
     data-route="{{ $cartucho->ruta ?? '#' }}"
     role="button"
     aria-label="Jugar {{ $cartucho->nombre }}"
     tabindex="0">
    
    <!-- Imagen del cartucho con texto DENTRO -->
    <div class="cartucho-imagen">
        <img src="{{ asset('img/cartuchoVerde.png') }}" 
             alt="{{ $cartucho->nombre }}" 
             class="cartucho-base">
        
        <!-- Texto dentro de la imagen del cartucho -->
        <div class="cartucho-texto-overlay">
            <h3 class="cartucho-titulo-overlay">{{ $cartucho->nombre }}</h3>
            <p class="cartucho-descripcion-overlay">{{ Str::limit($cartucho->descripcion, 50) }}</p>
        </div>
        
        @if($cartucho->etiqueta)
            <span class="cartucho-badge">{{ $cartucho->etiqueta }}</span>
        @endif
    </div>
    
    <!-- Información expandible (aparece debajo al hover) -->
    <div class="cartucho-info">
        <div class="cartucho-normas">
            <h4>📜 Normas</h4>
            <ul>
                @foreach($cartucho->normas as $norma)
                    <li>{{ $norma }}</li>
                @endforeach
            </ul>
        </div>
        
        <div class="cartucho-controles">
            <h4>🎮 Controles</h4>
            <div class="controles-lista">
                @foreach($cartucho->controles as $tecla => $accion)
                    <div class="control-item">
                        <kbd>{{ strtoupper($tecla) }}</kbd>
                        <span>{{ $accion }}</span>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</div>

{{-- JS INTEGRADO EN EL COMPONENTE --}}
<script>
(function() {
    const cartucho = document.querySelector('.cartucho-{{ $cartucho->id }}');
    
    if (!cartucho) return;
    
    // Click en el cartucho
    cartucho.addEventListener('click', async function() {
        await cargarJuegoDesdeCartucho(this);
    });
    
    // Enter en el cartucho (accesibilidad)
    cartucho.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            cargarJuegoDesdeCartucho(this);
        }
    });
    
    /**
     * CARGA EL JUEGO VIA AJAX
     */
    async function cargarJuegoDesdeCartucho(cartuchoElement) {
        const idJuego = cartuchoElement.dataset.cartucho;
        const nombreJuego = cartuchoElement.dataset.juego;
        const route = cartuchoElement.dataset.route;
        const pantalla = document.getElementById('pantallaJugable');
        
        if (!pantalla) {
            console.error('❌ No se encontró #pantallaJugable');
            return;
        }
        
        console.log(`🎮 Cargando: ${nombreJuego} (ID: ${idJuego})`);
        
        // Resetear cartucho anterior
        document.querySelectorAll('.cartucho-insertado').forEach(c => {
            c.classList.remove('cartucho-insertado');
        });
        
        // Animar inserción
        cartuchoElement.classList.add('cartucho-insertado');
        
        try {
            // Mostrar loader
            pantalla.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #4fc3f7; font-family: 'Fira Code', monospace;">
                    <div style="text-align: center;">
                        <div style="font-size: 3em; margin-bottom: 20px;">🔄</div>
                        <div style="font-size: 1.2em;">Cargando ${nombreJuego}...</div>
                    </div>
                </div>
            `;
            
            // Petición AJAX
            const response = await fetch(route, {
                headers: {
                    "X-Requested-With": "XMLHttpRequest"
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            pantalla.innerHTML = html;
            
            // Cargar scripts del juego
            await cargarScriptsJuego(idJuego);
            
            console.log(`✅ Juego ${idJuego} cargado correctamente`);
            
        } catch (error) {
            console.error('❌ Error cargando el juego:', error);
            pantalla.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #f44336; font-family: 'Fira Code', monospace;">
                    <div style="text-align: center;">
                        <div style="font-size: 3em; margin-bottom: 20px;">❌</div>
                        <div style="font-size: 1.2em;">Error al cargar el juego</div>
                        <div style="font-size: 0.9em; margin-top: 10px; color: #bdc3c7;">${error.message}</div>
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * CARGA LOS SCRIPTS ESPECÍFICOS DE CADA JUEGO
     */
    async function cargarScriptsJuego(idJuego) {
        // Mapeo de juegos a sus scripts
        const scriptsMap = {
            1: { // ASTRO
                main: window.rutaScripts?.astro,
                inicializador: window.rutaScripts?.astroInicializador
            }
            // Agregar más juegos aquí
        };
        
        const scripts = scriptsMap[idJuego];
        if (!scripts) {
            console.warn(`No hay scripts definidos para el juego ${idJuego}`);
            return;
        }
        
        // Cargar script principal
        if (scripts.main) {
            await cargarScript(scripts.main);
            console.log(`✅ Script principal cargado: ${scripts.main}`);
        }
        
        // Cargar script inicializador
        if (scripts.inicializador) {
            await cargarScript(scripts.inicializador, () => {
                // Ejecutar inicializador según el juego
                if (idJuego == 1 && typeof inicializadorAstro === 'function') {
                    inicializadorAstro();
                    console.log('✅ Inicializador Astro ejecutado');
                }
            });
        }
    }
    
    /**
     * FUNCIÓN AUXILIAR PARA CARGAR SCRIPTS
     */
    function cargarScript(src, onloadCallback = null) {
        return new Promise((resolve, reject) => {
            // Evitar cargar el mismo script múltiples veces
            const scriptExistente = document.querySelector(`script[src="${src}"]`);
            if (scriptExistente) {
                console.log(`⚠️ Script ya cargado: ${src}`);
                if (onloadCallback) onloadCallback();
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.type = "text/javascript";
            
            script.onload = () => {
                console.log(`✅ Script cargado: ${src}`);
                if (onloadCallback) onloadCallback();
                resolve();
            };
            
            script.onerror = () => {
                console.error(`❌ Error cargando script: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };
            
            document.body.appendChild(script);
        });
    }
})();
</script>