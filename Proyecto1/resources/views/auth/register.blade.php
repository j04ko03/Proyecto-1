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
                <form id="formRegister" method="POST" action="{{ route('usuarios.store') }}">
                    @csrf

                    <div style="border: 1px solid red; height: 100%; display: flex; flex-wrap: wrap;">
                        <div style="border:1px solid green; width: 50%;">
                            <label for="nombre">Nombre</label>
                            <input type="text" id="nombre" name="nombre" value="{{ old('nombre') }}">

                            <label for="apellido1">Primer Apellido</label>
                            <input type="text" id="apellido1" name="apellido1" value="{{ old('apellido1') }}">

                            <label for="apellido2">Segundo Apellido</label>
                            <input type="text" id="apellido2" name="apellido2" value="{{ old('apellido2') }}">

                            <label for="admin_secret">Clave secreta de administrador (opcional)</label>
                            <input type="password" id="admin_secret" name="admin_secret">
                            @error('admin_secret')
                                <div class="alert">{{ $message }}</div>
                            @enderror
                        </div>
                        <div style="border:1px solid green; width: 50%;">
                            <label for="nickname">Nickname*</label>
                            <input type="text" id="nickname" name="nickname" value="{{ old('nickname') }}" required>
                            @error('nickname')
                                <div class="alert">{{ $message }}</div>
                            @enderror

                            <label for="email">Correo electrónico*</label>
                            <input type="email" id="email" name="email" value="{{ old('email') }}" required>
                            @error('email')
                                <div class="alert">{{ $message }}</div>
                            @enderror

                            <label for="password">Contraseña*</label>
                            <input type="password" id="password" name="password" required>
                            @error('password')
                                <div class="alert">{{ $message }}</div>
                            @enderror

                            <label for="rePassword">Repetir contraseña*</label>
                            <input type="password" id="rePassword" name="password_confirmation" required>
                            @error('password')
                                <div class="alert">{{ $message }}</div>
                            @enderror
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