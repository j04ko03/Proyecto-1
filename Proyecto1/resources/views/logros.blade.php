 @extends('layouts.layoutPrivado')

@push('styles')
<link rel="stylesheet" href="{{ asset('assets/css/logros.css') }}">
@endpush

@section('content')
<div id="contenedor-scroll" class="logros-container">

    <h1>Tus Logros</h1>

    @foreach ($logros as $logro)
        @php
            $desbloqueado = in_array($logro->id, $logrosUsuario);
        @endphp

        <div class="logro-item {{ $desbloqueado ? '' : 'logro-locked' }}">
            <div class="logro-icon">
                🎖️
            </div>

            <div class="logro-info">
                <p class="logro-nombre">{{ $logro->nombre }}</p>
                <p class="logro-desc">{{ $logro->descripcion }}</p>
                <small style="color:#aaa;">Juego: {{ $logro->juego->nombre ?? 'General' }}</small>
            </div>

            <div class="logro-avatar-wrapper">
                <img 
                    src="{{ asset($desbloqueado ? 'img/capi1.png' : 'img/capi1.png') }}" 
                    class="logro-avatar"
                    alt="icono logro"
                >
            </div>

            <div>
                @if ($desbloqueado)
                    <span class="logro-check">✔</span>
                @endif
            </div>
        </div>

    @endforeach

</div>
@endsection