@extends('layouts.layoutPrivado')

@push('styles')
    <link rel="stylesheet" href="{{ asset('assets/css/metricas.css') }}">
@endpush

@section('content')

    <div id="metrics">
        <h1>Mètriques del joc</h1>
        <p>Carregant Pyodide i processant dades... pot trigar uns segons la primera vegada.</p>

        <div id="summary" class="metric-box"></div>

        <div class="metrics-grid">
        <div class="metric-box">
            <h3>Matriu de confusió</h3>
            <img id="img_cm" class="metric-img" alt="Matriu confusió" />
        </div>

        <div class="metric-box">
            <h3>Corba ROC</h3>
            <img id="img_roc" class="metric-img" alt="ROC" />
        </div>

        <div class="metric-box">
            <h3>Importància de variables</h3>
            <img id="img_feat" class="metric-img" alt="Feature importances" />
        </div>

        <div class="metric-box">
            <h3>Distribució sessions</h3>
            <img id="img_hist" class="metric-img" alt="Histograma sessions" />
        </div>

        <div class="metric-box">
            <h3>DAU</h3>
            <img id="img_dau" class="metric-img" alt="DAU" />
        </div>
        </div>

        <h3>Mètriques numèriques</h3>
        <pre id="metrics_text">Esperant resultats...</pre>
    </div>
    
  <!-- Pyodide -->
  <script src="https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js"></script>

  <!-- JS client -->
  <script src="{{ url('/js/metrics.js') }}"></script>

 
  <script>
    document.addEventListener("DOMContentLoaded", function () {

        // Llama al endpoint JSON
        fetch('metrics/sessions')
            .then(res => res.json())
            .then(data => {
                console.log("JSON generado:", data);
                // aquí puedes guardar los datos en una variable global, pasarlos a Pyodide, etc.
            })
            .catch(err => console.error("ERROR JSON:", err));

        // Llama al endpoint CSV
        fetch('metrics/sessions.csv')
            .then(res => res.text())
            .then(csv => {
                console.log("CSV generado:");
                console.log(csv);
            })
            .catch(err => console.error("ERROR CSV:", err));

    });
    </script>

@endsection