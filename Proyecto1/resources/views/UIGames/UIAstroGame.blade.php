<div id="contenedorJuego" class="contenedorJuego">
    <div id="ui" class="ui">
        <div class="ui-left" style="display: flex; flex-wrap: wrap; width: 150px;">
            <div style="width: 30%;">
                Nivel: <span id="nivel">1</span>
            </div>
            <div style="width: 4%;">
                |
            </div>
            <div style="width: 66%; display: flex; flex-wrap: wrap; width: 66%; justify-content: space-between; align-items: center;">
                <div style="width: 55%;">
                    Vidas: <span id="vidas">3</span>
                </div>
                <div style="width: 40%; height: 80%; display: flex; flex-wrap: wrap; justify-content: space-between; align-content: center;">
                    <img  id="cor1" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" style="width: 30%; height: auto%; object-fit: contain;">
                    <img id="cor2" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" style="width: 30%; height: auto%; object-fit: contain;">
                    <img id="cor3" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" style="width: 30%; height: auto%; object-fit: contain;">
                </div>
            </div>
        </div>
        <div class="ui-right">
            Puntos: <span id="puntos">0</span> &nbsp; | &nbsp; Tiempo: <span id="mejor">0</span>
        </div>
    </div>

    <!-- canva elemento html5 Lienzo donde para dibujar gráficos dinámicos usando el JavaScript -->
    <div id="contenedorCanvas" class="contenedorCanvas">
        <canvas id="canvas"></canvas>
    </div>
    
    <!-- Story de capi -->
    <div id="mensaje" class="mensaje">
        <h2 id="msg-title" class="msg-title" style="color: white">¡Bienvenido a Misión Matemática!</h2>
        <div id="msg-body" class="msg-body" style="color: white">
            Llega al final del nivel resolviendo las sumas. Presiona <strong>JUGAR</strong> para empezar.
        </div>
        <div style="margin-top:8px;">
            <button id="start-btn" class="start-btn" style="color: white">JUGAR</button>
        </div>
    </div>

    <!-- Contenedor Pregunstas -->
    <div id="modal">
      <h3 id="pregunta-text" style="color: white">¿Cuánto es 2 + 2 ?</h3>
      <input id="respuesta-input" type="number" inputmode="numeric" />
      <div class="controls">
        <button class="small cancel" id="cancel-btn">CANCELAR</button>
        <button class="small ok" id="submit-btn">ENVIAR</button>
      </div>
    </div>

    <!-- Contenedor ayuda movilidad -->
    <div id="help">Controles: ← → mover · Espacio saltar · E interactuar</div>

</div>

<!-- Cargar Script para añadir foto de fondo, botonera, video introducción, etc -->