@extends('layouts.layoutPrivado')

@section('content')

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
    
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
                    <button type="submit" class="font-semibold hover:underline border-0">
                        Del User
                    </button>
                </form>

                <button type="button"
                        class="btn-show-details font-semibold text-orange-500 hover:underline border-0">
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
                        class="btn-hide-details text-sm font-semibold text-orange-500 hover:underline border-0">
                    Hide details
                </button>
            </div>

            <p class="text-center font-semibold mb-3">Score MAX</p>

            <ul class="text-sm space-y-1">
                <li>Juego 1: -</li>
                <li>Juego 2: -</li>
                <li>Juego 3: -</li>
                <li>Juego 4: -</li>
            </ul>
        </div>

    </div>
    @endforeach

</div>

@endsection