@extends('layouts.layoutPublico')

@push('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/register.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/styles.css') }}">
@endpush

@section('content')
    <div class="contenedorPrincipal">
        <div class="contenedorLogin">
            <div class="contenedorConForma">
                <form id="">
                    <label for="email">Email/Usuario</label>
                    <input type="text" id="email" required autocomplete="username"/>

                    <label for="password" style="margin-top: 5%">Contraseña</label>
                    <input type="password" id="password" required autocomplete="current-password"/>

                    <label for="rePassword" style="margin-top: 5%">Repetir Contraseña</label>
                    <input type="rePassword" id="rePassword" required autocomplete="re-current-password"/>

                    <div class="links" style="margin-top: 5%">
                        <a href="#">Crear cuenta</a>
                        <button type="submit" class="btn-login">Iniciar sesión</button>
                    </div>
                </form>

                <img src="img/capiLogin.png" alt="Avion" class="avion" />
            </div>
        </div>
    </div>
@endsection