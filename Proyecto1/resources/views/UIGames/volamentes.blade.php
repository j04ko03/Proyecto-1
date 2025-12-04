<link rel="stylesheet" href="{{ asset('assets/css/UIVolamentes.css') }}">

<div id="fondo" class="fondo"></div>

<div id="contenedor_juego" class="contenedor_juego">

    <h1 class="titulo-juego">Volamentes</h1>

    <p id="textoPregunta" class="texto-pregunta">
        Presione "Siguiente" para comenzar
    </p>

    <div id="opciones" class="opciones"></div>

    <div class="contenedor-botones">
        <button id="btnSiguiente" class="btn-volamentes">Siguiente</button>
    </div>

    <p id="puntaje" class="puntaje"></p>

</div>

<script src="{{ asset('js/Volamentes/volamentes.js') }}"></script>
    