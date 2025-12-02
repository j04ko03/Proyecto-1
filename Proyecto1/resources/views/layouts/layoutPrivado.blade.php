<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>JUEGOS</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap" rel="stylesheet">

    <!-- CSS base -->
    <link rel="stylesheet" href="{{ asset('assets/css/layoutPublicoPrivado.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/barraNavegacion.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/UIGameAstro.css') }}">

    <!-- CSS de vistas hijas -->
    @stack('styles')
</head>

<body class="background">
    <!-- Navbar -->
    @include('barraNavegacion', ['usuario' => Auth::user()->nickName])
    
    <!-- Contenido principal -->
    <main class="main-content">
        @yield('content')
    </main>

    @include('components.desplegable')
    
    <!-- SCRIPTS GLOBALES (se cargan siempre) -->
    <script src="{{ asset('js/usuarios.js') }}"></script>
    <script src="{{ asset('js/1BotonesJuegos.js') }}"></script>
    <script src="{{ asset('js/consolaResizeManager.js') }}"></script>
    
    <script>
        window.rutaScripts = {
            redimensionador: "{{ asset('js/RedimensionCava.js') }}",
        };
    </script>

    <!-- SCRIPTS DE VISTAS HIJAS (se agregan dinámicamente) -->
    @stack('scripts')
</body>
</html>