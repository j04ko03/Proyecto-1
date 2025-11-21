<div class="retro-navbar" style="border: 1px solid purple; height: 10%; width: 100%;">

    <!-- NOMBRE DEL USUARIO -->
    <div class="nombre">
        <span class="arroba">@</span> {{ Auth::user()->nickName }}
    </div>

    @if (Auth::user()->id_rol == 3)
        <!-- BUSCADOR -->
        <div class="buscador">
            <input type="text" id="searchInput" placeholder="Buscar juego...">
        </div>
    @endif

    <!-- ENGRANAJE -->
    @include('components.rueda-settings')
    
    </div>
</div>