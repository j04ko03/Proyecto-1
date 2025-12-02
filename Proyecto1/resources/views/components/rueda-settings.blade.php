    <div id="botonesJuegos" class="contenedorPrincipalHome" style="border: 1px solid red; width: 100%; height: 240px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <a href="#" style="color: white">Sin Juego</a>
        <a href="#" id="btnJuego1" data-route="{{ route('astro.controller') }}" style="color: white">Juego 1</a>
        <a href="#" id="btnJuego2" data-route="{{ route('volamentes.controller') }}">Juego 2</a>
        <a href="#" id="btnJuego3" data-route="{{ route('capi.controller') }}" style="color: white">Juego 3</a>
        <a href="#" style="color: white">Juego 4</a>
    </div>

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

