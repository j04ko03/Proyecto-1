<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Juegos</title>

    <!-- Tailwind CDN -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;700&display=swap" rel="stylesheet">

    <!-- CSS base -->
    <link rel="stylesheet" href="{{ asset('assets/css/layoutPublicoPrivado.css') }}">

    <!-- CSS de vistas hijas -->
    @stack('styles')
</head>

<body class="background">

    <!-- Contenido principal -->
    <main class="main-content">
        <div class="contenedorTitulo">
            <h1>Bienvenid<span class="arroba">@</span> Gamer</h1>
        </div>
        @yield('content')
    </main>

    @stack('scripts')
</body>
</html> 