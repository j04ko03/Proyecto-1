<div class="cartucho cartucho-{{ $cartucho->id }} {{ $cartucho->isBlocked ? 'bloqueado' : '' }}" 
    data-cartucho="{{ $cartucho->id }}" 
    data-juego="{{ $cartucho->nombre }}"
    data-route="{{ $cartucho->ruta ?? '#' }}" 
    aria-label="Jugar {{ $cartucho->nombre }}" 
    data-script="{{ asset('js/' . 'RedimensionCava' . '.js') }}"
    @unless($cartucho->isBlocked)
        role="button"
        tabindex="0"
    @endunless

    data-bloqueado="{{ ($cartucho->isBlocked === '1') ? 'bloqueado' : '' }}"
    >

    <div class="cartucho-imagen">
        <img src="{{ asset('img/cartuchoVerde.png') }}" alt="{{ $cartucho->nombre }}" class="cartucho-base">

        <div class="cartucho-texto-overlay"
            @if($cartucho->imagen)
                style="background-image: url('{{ asset('img/' . $cartucho->imagen) }}');"
            @endif
        >
            <h3 class="cartucho-titulo-overlay">{{ $cartucho->nombre }}</h3>
            <p class="cartucho-descripcion-overlay">{{ Str::limit($cartucho->descripcion, 50) }}</p>
        </div>

        @if ($cartucho->etiqueta)
            <span class="cartucho-badge">{{ $cartucho->etiqueta }}</span>
        @endif
    </div>

</div>
