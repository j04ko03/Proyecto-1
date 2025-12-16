<div class="retro-navbar" style="height: 10%; width: 100%;">

    <!-- NOMBRE DEL USUARIO -->
    <div class="nombre">
        <span class="arroba">@</span> {{ Auth::user()->nickName }}
    </div>

    @if (Request::routeIs('home.controller'))
        @if (Auth::user()->id_rol == 3 || Auth::user()->id_rol == 2 || Auth::user()->id_rol == 1)
            <!-- BUSCADOR -->
            <form action="{{ route('home.controller') }}" method="get">
                @csrf
                <div style="display: flex; flex-wrap: wrap; justify-content: space-around;">
                    <div class="buscador">
                        <input type="text" id="searchInput" name="codi_buscar" value=""
                            placeholder="Buscar juego...">
                    </div>
                    <div class="col-2 pt-2">
                        <button type="submit" class="btn btn-primary" style="color: white">Filtrar</button>
                    </div>
                </div>
            </form>
        @endif
    @endif


    <!-- ENGRANAJE -->
    @include('components.desplegable')

    <div class="opciones">
        <img src="{{ asset('img/iconoSettings.png') }}" alt="Opciones" class="iconoEngranaje">

        <div class="dropdown"> {{-- //////// Rol: 1 = SuperAdmin, Rol 2 = Admin, Rol 3 = Usuario //////// --}}
            <a href="{{ route('home.controller') }}">Home</a>
            {{-- <a href="#">Perfil</a> --}}
            @if (Auth::user()->id_rol == 1 || Auth::user()->id_rol == 2)
                <a href="{{ route('usuarios.index') }}">Usuarios</a>
            @endif
            @if (Auth::user()->id_rol == 1 || Auth::user()->id_rol == 2)
                <a href="{{ route('metricas.controller') }}">Estadísticas</a>
            @endif
            @if (Auth::user()->logros()->count() > 0)
                <a href="{{ route('logros.controller') }}">Logros</a>
            @endif
            <a href="{{ route('logout.controller') }}">Cerrar sesión</a>
        </div>
    </div>
</div>
