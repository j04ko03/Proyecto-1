 @extends('layouts.layoutPrivado')

@push('styles')
<link rel="stylesheet" href="{{ asset('assets/css/logros.css') }}">
@endpush

@section('content')
@include('errores2')
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

            <div class="logro-avatar-wrapper" style="margin-right: 10px">
                @php
                $componente = "../Astro/motor.png";
                switch($logro->id){
                    case 1:
                        $componente = "../Astro/motor.png";
                        break;
                    case 2:
                        $componente = "../Astro/alaD.png";
                        break;
                    case 5:
                        $componente = "../Astro/ala.png";
                        break;
                    case 6:
                        $componente = "../Astro/cabina.png";
                        break;
                    case 7:
                        $componente = "../Astro/sisNav.png";
                        break;
                    default:
                        $componente = "../Astro/motor.png";
                        break;
                }
                @endphp
                <img 
                    src="{{ asset($desbloqueado ? $componente : $componente) }}" 
                    class="logro-avatar"
                    alt="icono logro"
                >
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