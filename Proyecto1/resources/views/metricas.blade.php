@extends('layouts.layoutPrivado')

@push('styles')
<link rel="stylesheet" href="{{ asset('assets/css/metricas.css') }}">
@endpush

@section('content')

    <div id="metrics">
        <h1>Mètriques del joc</h1>
        <p>Carregant Pyodide i processant dades... pot trigar uns segons la primera vegada.</p>

        <div id="summary" class="metric-box"></div>

        <!-- Todas las imágenes dinámicas -->
        <div id="all_images" class="metrics-grid"></div>

        <h3>Mètriques numèriques</h3>
        <pre id="metrics_text">Esperant resultats...</pre>
    </div>

    <!-- Pyodide -->
    <script src="https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js"></script>

    <!-- JS de métricas -->
    <script src="{{ url('/js/metrics.js') }}"></script>

@endsection
