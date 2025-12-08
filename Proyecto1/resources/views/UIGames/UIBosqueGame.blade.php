<div id="contenedorJuego" class="contenedorJuego" style="position: relative; width: 100%; height: 100%; background: linear-gradient(180deg, #87CEEB 0%, #90EE90 100%);">
    
    {{-- UI Superior - Información del juego --}}
    <div id="ui" class="ui" style="position: absolute; left: 8px; top: 8px; right: 8px; display: flex; justify-content: space-between; align-items: center; pointer-events: none; font-size: 12px; z-index: 10;">
        
        {{-- Panel izquierdo --}}
        <div class="ui-left" style="background: rgba(0,0,0,0.7); padding: 8px 12px; border-radius: 8px; color: white; pointer-events: auto; font-family: 'Pixelify Sans', monospace;">
            <div style="display: flex; gap: 15px; align-items: center;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="font-size: 16px;">🌲</span>
                    <span>Nivel: <strong id="nivel">1</strong></span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="font-size: 16px;">⭐</span>
                    <span>Resueltos: <strong id="score">0</strong></span>
                </div>
            </div>
        </div>
        
        {{-- Panel derecho --}}
        <div class="ui-right" style="background: rgba(0,0,0,0.7); padding: 8px 12px; border-radius: 8px; color: white; pointer-events: auto; font-family: 'Pixelify Sans', monospace;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span id="nivel-nombre">Secuencias Básicas</span>
            </div>
        </div>
    </div>

    {{-- Canvas del juego --}}
    <div id="contenedorCanvas" class="contenedorCanvas" style="width: 100%; height: 100%; position: relative;">
        <canvas id="canvas" style="display: block; width: 100%; height: 100%; image-rendering: pixelated;"></canvas>
    </div>
    
    {{-- Controles (opcional - se muestra en móviles) --}}
    <div id="help" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 8px 16px; border-radius: 20px; font-size: 11px; font-family: 'Pixelify Sans', monospace; pointer-events: none; z-index: 10;">
        Controles: ← → mover · Espacio saltar · E interactuar
    </div>

    {{-- Mensaje de inicio/fin de nivel (oculto por defecto) --}}
    <div id="mensaje" class="mensaje" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.85); padding: 20px 30px; border-radius: 12px; display: none; z-index: 100; max-width: 80%; text-align: center; border: 3px solid #4fc3f7; box-shadow: 0 0 20px rgba(79, 195, 247, 0.5);">
        <h2 id="msg-title" class="msg-title" style="color: #4fc3f7; margin: 0 0 15px 0; font-size: 24px; font-family: 'Pixelify Sans', monospace;">¡Bienvenido!</h2>
        <div id="msg-body" class="msg-body" style="color: white; margin-bottom: 20px; line-height: 1.6; font-family: 'Pixelify Sans', monospace; font-size: 14px;">
            Cargando aventura...
        </div>
        <button id="start-btn" class="start-btn" style="background: #4fc3f7; color: #000; border: none; padding: 12px 30px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; font-family: 'Pixelify Sans', monospace; transition: all 0.3s ease;">
            COMENZAR
        </button>
    </div>

    {{-- Modal para desafíos (se usa desde JavaScript) --}}
    <div id="modal-challenge" style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.95); padding: 25px; border-radius: 12px; display: none; z-index: 200; max-width: 500px; width: 90%; border: 3px solid #ff00ff; box-shadow: 0 0 30px rgba(255, 0, 255, 0.5);">
        <h3 id="challenge-title" style="color: #ff00ff; margin: 0 0 15px 0; font-size: 20px; font-family: 'Pixelify Sans', monospace;">Desafío</h3>
        <p id="challenge-text" style="color: white; margin-bottom: 15px; line-height: 1.6; font-family: 'Pixelify Sans', monospace; font-size: 14px;"></p>
        <input id="challenge-input" type="text" placeholder="Tu respuesta..." style="width: 100%; padding: 10px; margin-bottom: 15px; border: 2px solid #ff00ff; background: #1a1a1a; color: white; border-radius: 6px; font-family: 'Pixelify Sans', monospace; font-size: 14px; box-sizing: border-box;">
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="challenge-cancel" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-family: 'Pixelify Sans', monospace; font-weight: bold;">CANCELAR</button>
            <button id="challenge-submit" style="background: #4fc3f7; color: #000; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-family: 'Pixelify Sans', monospace; font-weight: bold;">ENVIAR</button>
        </div>
    </div>
</div>