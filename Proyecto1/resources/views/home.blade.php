@extends('layouts.layoutPrivado')

@push('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/styles.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/home.css') }}">
@endpush

@section('content')
{{-- Consola Gamer --}}
<div class="consola">
    <div class="led-power"></div>
    
    <!-- Detalles decorativos -->
    <div class="corner-detail top-left"></div>
    <div class="corner-detail top-right"></div>
    <div class="corner-detail bottom-left"></div>
    <div class="corner-detail bottom-right"></div>
    
    <div class="side-line top"></div>
    <div class="side-line bottom"></div>
    
    <div class="interiorConsola">
        {{-- D-Pad izquierdo --}}
        <div class="izquierda">
            <div class="d-pad-container">
                <button class="d-pad-btn up" data-key="w" aria-label="Arriba"></button>
                <button class="d-pad-btn right" data-key="d" aria-label="Derecha"></button>
                <button class="d-pad-btn down" data-key="s" aria-label="Abajo"></button>
                <button class="d-pad-btn left" data-key="a" aria-label="Izquierda"></button>
            </div>
        </div>
        
        {{-- Pantalla central --}}
        <div class="pantallaConsola">
            <div id="pantallaJuego" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                {{-- Aquí se cargará el contenido del juego vía AJAX --}}
                <div id="pantallaJugable" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #4fc3f7; font-family: 'Fira Code', monospace;">
                    <div style="text-align: center;">
                        <div style="font-size: 3em; margin-bottom: 20px;">🎮</div>
                        <div style="font-size: 1.2em;">Selecciona un juego</div>
                        <div style="font-size: 0.9em; margin-top: 10px; color: #bdc3c7;">Haz click en un cartucho para comenzar</div>
                    </div>
                </div>
            </div>
        </div>
        
        {{-- Botones A/B derechos --}}
        <div class="derecha">
            <button class="action-btn btn-a" data-key="space" aria-label="Botón A">A</button>
            <button class="action-btn btn-b" data-key="e" aria-label="Botón B">B</button>
        </div>
    </div>
</div>

{{-- Cartuchos --}}
<div class="cartuchos">
    @foreach ($cartuchos as $cartucho)
        <x-cartucho :cartucho="$cartucho" />
    @endforeach
</div>

{{-- Script para salir del juego con ESC --}}
<script>
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const pantalla = document.getElementById('pantallaJugable');
        if (pantalla) {
            // Resetear pantalla
            pantalla.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 3em; margin-bottom: 20px;">🎮</div>
                    <div style="font-size: 1.2em;">Selecciona un juego</div>
                    <div style="font-size: 0.9em; margin-top: 10px; color: #bdc3c7;">Haz click en un cartucho para comenzar</div>
                </div>
            `;
            
            // Remover estado de cartucho insertado
            document.querySelectorAll('.cartucho-insertado').forEach(c => {
                c.classList.remove('cartucho-insertado');
            });
            
            console.log('👋 Juego cerrado');
        }
    }
});
</script>

@endsection