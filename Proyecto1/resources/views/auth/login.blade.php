@extends('layouts.layoutPublico')

@push('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/login.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/loginRegistroComun.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/styles.css') }}">
@endpush

@section('content')
    <div class="contenedorPrincipal">
        <div class="contenedorLogin">
            <div class="contenedorConForma">
                @if (session('Error'))
                    <div class="alert alert-danger">
                        {{ session('Error') }}
                    </div>
                @endif
                <form id="" action="{{ route('login.submit') }}" method="post">
                    @csrf
                    <label for="correr">Email/NickName</label>
                    <input type="text" id="correo" name="correo" required autocomplete="username"/>

                    <label for="password" style="margin-top: 5%">Contraseña</label>
                    <input type="password" id="password" name="password" required autocomplete="current-password"/>

                    <div class="links" style="margin-top: 5%">
                        <a class="btn-re" href="{{ route('usuarios.create') }}">Crear cuenta</a>
                        <button type="submit" class="btn-login">Iniciar sesión</button>
                    </div>
                </form>

                <img src="img/capiLogin.png" alt="Avion" class="avion" />
            </div>
        </div>
    </div>

        <script src="{{ url('/js/loginMusic.js') }}"></script>
@endsection