    <div class="opciones">
        <img src="{{ asset('img/iconoSettings.png') }}" alt="Opciones" class="iconoEngranaje">

        <div class="dropdown">
            {{-- <a href="#">Configuración</a>
            <a href="#">Perfil</a> --}}

            {{-- 1 es admin, 2 es superadmin --}}
            @if(Auth::user()->id_rol === '1' || Auth::user()->id_rol === '2') 
                {{-- TODO: PONER RUTA A USUARIOS --}}
                <a href="{{ route('home.controller') }}">Usuarios</a> 
            @endif        
            {{-- 1 es admin --}}
            @if(Auth::user()->id_rol === '1') 
            {{-- TODO: PONER RUTA A ESTADISTICAS --}}
                <a href="{{ route('home.controller') }}">Estadísticas</a> 
            @endif        
            {{-- LO VEN TODOS LOS USUARIOS --}}
            <a href="{{ route('logout.controller') }}">Cerrar sesión</a> 
        </div>

    