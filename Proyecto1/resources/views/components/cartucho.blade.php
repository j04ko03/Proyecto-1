<div class="cartucho cartucho-{{ $cartucho->id }}" 
    data-cartucho="{{ $cartucho->id }}" 
    data-juego="{{ $cartucho->nombre }}"
    data-route="{{ $cartucho->ruta ?? '#' }}" 
    role="button" 
    aria-label="Jugar {{ $cartucho->nombre }}" 
    tabindex="0"
    data-script="{{ asset('js/' . 'RedimensionCava' . '.js') }}">

    <div class="cartucho-imagen">
        <img src="{{ asset('img/cartuchoVerde.png') }}" alt="{{ $cartucho->nombre }}" class="cartucho-base">

        <div class="cartucho-texto-overlay">
            <h3 class="cartucho-titulo-overlay">{{ $cartucho->nombre }}</h3>
            <p class="cartucho-descripcion-overlay">{{ Str::limit($cartucho->descripcion, 50) }}</p>
        </div>

        @if ($cartucho->etiqueta)
            <span class="cartucho-badge">{{ $cartucho->etiqueta }}</span>
        @endif
    </div>

    <div class="cartucho-info">
        <div class="cartucho-normas">
            <h4>📜 Normas</h4>
            <ul>
                @foreach ($cartucho->normas as $norma)
                    <li>{{ $norma }}</li>
                @endforeach
            </ul>
        </div>

        <div class="cartucho-controles">
            <h4>🎮 Controles</h4>
            <div class="controles-lista">
                @foreach ($cartucho->controles as $tecla => $accion)
                    <div class="control-item">
                        <kbd>{{ strtoupper($tecla) }}</kbd>
                        <span>{{ $accion }}</span>
                    </div>
                @endforeach
            </div>
        </div>
    </div> --}}
</div>
