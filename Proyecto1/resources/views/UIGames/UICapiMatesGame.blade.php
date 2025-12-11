<div id="juegoCapiMates" class="juegoCapiMates">

    {{-- Panel del juego --}}

    <div id="ui" class="ui uiCapi">
        <div class="ui-left vidas-container">
            <div class="vidas-inner">
                <div class="vidas-label">
                    <span id="contadorVidas"> Vidas</span>
                </div>
                <div class="vidas-icons" id="vidasPanel">
                    <img id="corazon3" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" class="vida-img">
                    <img id="corazon2" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" class="vida-img">
                    <img id="corazon1" src="/Proyecto-1/Proyecto1/Astro/corazon.png" alt="Imagen de vida" class="vida-img">
                </div>
            </div>
        </div>

        <div class="ui-right">
            <span class="puntaje"> Puntaje: <span id="puntaje"> 0 </span></span>
        </div>
    </div>

    <!-- Mensaje del principio -->
    <div id="mensaje" class="mensaje">
        <h2 id="msg-title" class="msg-title"></h2>
        <div id="msg-body" class="msg-body"></div>
        <div class="btn-container">
            <button id="start-btn" class="start-btn">JUGAR</button>
        </div>
    </div>

    {{-- Objetos del juego suelo y personaje  --}}
    <div id="personaje" class="personaje"></div>
    <div id="enemigos"></div>
    <div class="piso"></div>

    {{-- Contenedor Preguntas --}}
    <div id="quizPopup" class="quiz-popup hidden">     {{-- Volver a poner hidden --}}

        <div class="quiz-header">
          <span class="quiz-title">Preguntas del bosque</span>
          <span id="cerrar-popup" class="quiz-close">✖</span>
        </div>

        <div class="quiz-body">

            <p id="quizQuestion"></p>

          <input id="quizAnswer" type="text" placeholder="Escribe tu respuesta"/>

          <button id="revisar-respuesta-btn">Responder</button>

        </div>
    </div>
</div>