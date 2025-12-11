@extends('layouts.layoutPrivado')

@push('styles')
<link rel="stylesheet" href="{{ asset('assets/css/metricas.css') }}">
@endpush

@section('content')

    <div id="metrics">
        <h1>Mètriques del joc</h1>
        <p>Carregant Pyodide i processant dades... pot trigar uns segons la primera vegada.</p>

        <div id="summary" class="metric-box"></div>
        
    <div id="contenedor-scroll" class="scrollable-metrics">
        <div>
            <h3 style="color: #F28918">Mètriques numèriques</h3>
            <pre id="metrics_text" style="color: #F28918">Esperant resultats...</pre>
        </div>
            <!-- Todas las imágenes que llegand des nuestros scripts -->
        <div id="all_images" class="metrics-grid"></div>
    </div>

        
    </div>

    <!-- Pyodide Importante lo debo usar aqui sinó lanza error -->
    <script src="https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js"></script>

    <!-- JS métricas -->
    <script src="{{ url('/js/metrics.js') }}"></script>

@endsection
