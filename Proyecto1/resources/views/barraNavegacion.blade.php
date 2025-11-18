<div class="retro-navbar" style="border: 1px solid purple; height: 10%; width: 100%;">
    
    <!-- NOMBRE DEL USUARIO -->
    <div class="nombre">
        <span class="arroba">@</span> {{Auth::user()->nickName}}
    </div>

    <!-- BUSCADOR -->
    <div class="buscador">
        <input type="text" id="searchInput" placeholder="Buscar juego...">
    </div>    <div class="opciones">
        <img src="{{ asset('img/iconoSettings.png') }}" alt="Opciones" class="iconoEngranaje">

        <div class="dropdown">
            {{-- <a href="#">Configuración</a>
            <a href="#">Perfil</a> --}}

            @if(Auth::user()->id === '1' || Auth::user()->rol === '2')
                <a href="{{ route('') }}">Usuarios</a>
            @endif        
            @if(Auth::user()->rol === '1')
                <a href="{{ route('') }}">Estadísticas</a>
            @endif        
            <a href="{{ route('logout.controller') }}">Cerrar sesión</a>
        </div>
    
    </div>
</div>