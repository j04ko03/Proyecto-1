@extends('layouts.layoutPrivado')
@push('styles')
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    <link rel="stylesheet" href="{{ asset('css/home.css') }}">
@endpush

@section('content')

<div>
    <div class="contenedorPrincipalHome" style="border: 1px solid red; width: 100%; height: 600px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <a style="color: white" href="#">Aqui va la pantalla de los juegos</a>
        <div id="pantallaJugable" style="border: 2px solid white; width: 60%; height: 60%;">

        </div>
    </div>
    <div class="contenedorPrincipalHome" style="border: 1px solid red; width: 100%; height: 240px; display: flex; flex-direction: column; justify-content: center; align-items: center;">

    </div>
</div>

@endsection