@extends('layouts.layoutPublico')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    <link rel="stylesheet" href="{{ asset('css/home.css') }}">
@endpush

@section('content')
{{-- Marco de la consola --}}
    <div class="consola"> 
        <img src="{{ asset('img/consola.svg') }}" class="consola-frame" alt="Consola">

<div>
    <div class="contenedorPrincipalHome" style="border: 1px solid red; width: 100%; height: 600px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <a style="color: white" href="#">Aqui va la pantalla de los juegos</a>
        <div id="pantallaJugable" style="border: 2px solid white; width: 60%; height: 60%;">

        </div>
        <a style="color: white" href="#">Best Player: Player</a>
    </div>
    <div id="botonesJuegos" class="contenedorPrincipalHome" style="border: 1px solid red; width: 100%; height: 240px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <a href="#" style="color: white">Sin Juego</a>
        <a href="#" id="btnJuego1" data-route="{{ route('astro.controller') }}" style="color: white">Juego 1</a>
        <a href="#" style="color: white">Juego 2</a>
        <a href="#" style="color: white">Juego 3</a>
        <a href="#" style="color: white">Juego 4</a>
    </div>
</div>

<script src="{{ asset('js/1BotonesJuegos.js') }}"></script>


@endsection
