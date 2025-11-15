@extends('layouts.layoutPublico')

@push('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/register.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/loginRegistroComun.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/styles.css') }}">
@endpush

@section('content')
    <div class="contenedorPrincipal">
        <div class="contenedorLogin">
            
            

            <div class="contenedorConForma" style="border: 1px solid green; padding-left: 15%;">
                <form id="">
                    @csrf

                    <div style="border: 1px solid red; height: 100%; display: flex; flex-wrap: wrap;">
                        <div style="border:1px solid green; width: 50%;">
                            <label for="nombre">Nombre</label>
                            <input type="text" id="nombre" name="nombre" required>

                            <label for="apellido1">Primer Apellido</label>
                            <input type="text" id="apellido1" name="apellido1" required>

                            <label for="apellido2">Segundo Apellido</label>
                            <input type="text" id="apellido2" name="apellido2">
                        </div>
                        <div style="border:1px solid green; width: 50%;">
                            <label for="nickname">Nickname</label>
                            <input type="text" id="nickname" name="nickname" required>

                            <label for="correo">Correo electrónico</label>
                            <input type="email" id="correo" name="correo" required>

                            <label for="password">Contraseña</label>
                            <input type="password" id="password" name="password" required>

                            <label for="password">Repetir contraseña</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <div class="links" style="width: 100%">
                            <a href="{{ route('login.controller') }}">Volver a login</a>
                            <button type="submit" class="btn-register">Crear cuenta</button>
                        </div>

                    </div>

                </form>
            </div>

            <img src="{{ asset('img/capiLogin.png') }}" alt="Avion" class="avion" />
        </div>
    </div>
@endsection