@extends('layouts.layoutPrivado')

@push('styles')
<link rel="stylesheet" href="{{ asset('assets/css/users.css') }}">
@endpush

@section('content')

<div id="contenedor-scroll" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 contenedor-scroll">

    @foreach($usuario as $user)

    <div class="user-card-wrapper">

        {{-- ESTADO CERRADO --}}
        <div class="card-collapsed bg-white rounded-2xl shadow-md px-6 py-4">
            <div class="flex justify-between items-center mb-2">
                <p class="font-semibold text-lg tracking-wide">
                    {{ $user->nombre }}
                </p>
                <span class="text-sm font-semibold">
                    Rol: {{ $user->rol->rol }}
                </span>
            </div>

            <p class="text-sm mb-6">{{ $user->email }}</p>

            <div class="flex justify-between items-center text-sm">
                <form method="POST" action="{{ route('usuarios.destroy', $user->id) }}">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="font-semibold hover:underline">
                        Del User
                    </button>
                </form>

                <button type="button"
                        class="btn-show-details font-semibold text-orange-500 hover:underline">
                    Details
                </button>
            </div>
        </div>

        {{-- ESTADO ABIERTO --}}
        <div class="card-expanded bg-white rounded-2xl shadow-md px-6 py-4 hidden">
            <div class="flex justify-between items-center mb-4">
                <p class="font-semibold text-lg tracking-wide">
                    {{ $user->nombre }}
                </p>

                <button type="button"
                        class="btn-hide-details text-sm font-semibold text-orange-500 hover:underline">
                    Hide details
                </button>
            </div>

            <p class="text-center font-semibold mb-3">Score MAX</p>

            <ul class="text-sm space-y-1">
                <li>Juego 1: - {{ $user->maxScoreByGame(1) }}</li>
                <li>Juego 2: - {{ $user->maxScoreByGame(2) }}</li>
                <li>Juego 3: - {{ $user->maxScoreByGame(1002) }}</li>
                <li>Juego 4: - {{ $user->maxScoreByGame(2002) }}</li>
                <li>Nº Logros: - {{ $user->logros()->count() }}</li>
            </ul>
        </div>

    </div>
    @endforeach

</div>

{{-- PAGINACIÓN BOOTSTRAP --}}
<div class="d-flex justify-content-center mt-4 mb-4">
    <div>
        {{ $usuario->links('pagination::bootstrap-5') }}
    </div>
</div>

@endsection