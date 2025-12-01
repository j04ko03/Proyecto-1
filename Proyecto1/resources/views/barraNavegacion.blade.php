<div class="retro-navbar" style="border: 1px solid purple; height: 10%; width: 100%;">

    <!-- NOMBRE DEL USUARIO -->
    <div class="nombre">
        <span class="arroba">@</span> {{ Auth::user()->nickName }}
    </div>

    @if (Auth::user()->id_rol == 3)
        <!-- BUSCADOR -->
        <form action="{{ route('home.controller') }}" method="get">
            @csrf
            <div class="buscador">
                <input type="text" id="searchInput" name="codi_buscar" value="" placeholder="Buscar juego...">
            </div>
            <div class="col-2 pt-2">
                <button type="submit" class="btn btn-primary" style="color: white">Filtrar</button>
            </div>
        </form>
    @endif
    


    <!-- ENGRANAJE -->
    @include('components.rueda-settings')
    
    </div>
</div>