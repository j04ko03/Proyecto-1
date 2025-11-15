@extends('layouts.layoutPublico')

@push('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/styles.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/home.css') }}">
@endpush

@section('content')
{{-- Marco de la consola --}}
    <div class="consola"> 
        <img src="{{ asset('img/consola.svg') }}" class="consola-frame" alt="Consola">

        <div class="interiorConsola">

            {{-- Contenido del lado izquierdo de la consola --}}
            <div class="izquierda"> 
                <div class="d-pad-container">
                    <button class="d-pad-btn up" data-key="w" data-action="move">
                        <span></span>
                    </button>
                    <button class="d-pad-btn right" data-key="d" data-action="move">
                        <span></span>
                    </button>
                    <button class="d-pad-btn down" data-key="s" data-action="move">
                        <span></span>
                    </button>
                    <button class="d-pad-btn left" data-key="a" data-action="move">
                        <span></span>
                    </button>
                </div>
            </div>

            {{-- Pantalla --}}
            <div class="pantallaConsola"> 
                <canvas id="pantallaJuego"></canvas>
            </div>

            {{-- Contenido del lado derecho de la consola --}}
            <div class="derecha"> 
                <button class="action-btn btn-a" data-key=" " data-action="jump">
                    <span>A</span>
                </button>
                <button class="action-btn btn-b" data-key="e" data-action="interact">
                    <span>B</span>
                </button>
            </div>
        </div>
    </div>

    {{-- Llamada componente de los cartuchos --}}
    <div class="cartuchos"> 
        @foreach ($cartuchos as $cartucho)
            <x-cartucho :cartucho="$cartucho" />
        @endforeach
    </div>

    @push('scripts')
        <script src="{{ asset('assets/js/cartuchos.js') }}"></script>
    @endpush
@endsection
