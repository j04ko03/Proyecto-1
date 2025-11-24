<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title class="pestaña">JUEGOS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="{{ asset('js/usuarios.js') }}"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap" rel="stylesheet">

    <!-- CSS base -->
    <link rel="stylesheet" href="{{ asset('assets/css/layoutPublicoPrivado.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/barraNavegacion.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/UIGameAstro.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/UIGameCapiMates.css') }}">

    <!-- CSS de vistas hijas -->
    @stack('styles')
</head>

@push('scripts')
    <script src="{{ asset('js/1BotonesJuegos.js') }}"></script>
@endpush

<body class="background">
    <!-- Navbar -->
    @include('barraNavegacion', ['usuario' => Auth::user()->nickName])
    
    <!-- Contenido principal -->
    <main class="main-content">
        @yield('content')
    </main>

    <script>
        window.rutaScripts = {
            redimensionador: "{{ asset('js/RedimensionCava.js') }}",
        };
    </script>

    @stack('scripts')

    
    
</body>
</html>