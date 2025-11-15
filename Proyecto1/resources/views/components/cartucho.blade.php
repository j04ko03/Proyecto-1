<div class="cartucho cartucho-{{ $cartucho->id }}" 
     data-cartucho="{{ $cartucho->id }}"
     data-juego="{{ $cartucho->nombre }}"
     onclick="cargarJuego({{ $cartucho->id }})"
     role="button"
     aria-label="Jugar {{ $cartucho->nombre }}"
     tabindex="0">
    
    <div class="cartucho-imagen">
        <img src="{{ asset('img/cartuchoVerde.png') }}" alt="{{ $cartucho->nombre }}">
        @if($cartucho->etiqueta)
            <span class="cartucho-badge">{{ $cartucho->etiqueta }}</span>
        @endif
    </div>
    
    <div class="cartucho-info">
        <h3 class="cartucho-titulo">{{ $cartucho->nombre }}</h3>
        <p class="cartucho-descripcion">{{ $cartucho->descripcion }}</p>
        
        <div class="cartucho-normas">
            <h4>Normas:</h4>
            <ul>
                @foreach($cartucho->normas as $norma)
                    <li>{{ $norma }}</li>
                @endforeach
            </ul>
        </div>
        
        <div class="cartucho-controles">
            <h4>Controles:</h4>
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