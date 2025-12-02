async function runMetrics() {
    const status = document.querySelector('#metrics p');
    try {
        status && (status.textContent = "Carregant Pyodide...");

        const pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.2/full/"
        });

        status && (status.textContent = "Instal·lant dependències (micropip)...");
        await pyodide.loadPackage(['micropip']);
        const micropip = pyodide.pyimport('micropip');

        status && (status.textContent = "Instal·lant pandas, scikit-learn, matplotlib...");
        await micropip.install('pandas');
        await micropip.install('scikit-learn');
        await micropip.install('matplotlib');

        status && (status.textContent = "Carregant script ML...");
        const pyCodeResp = await fetch('/Proyecto-1/Proyecto1/public/js/script_ml.py');
        const pyCode = await pyCodeResp.text();
        pyodide.runPython(pyCode);

        status && (status.textContent = "Obtenint dades del servidor...");
        const resp = await fetch('/Proyecto-1/Proyecto1/public/metrics/sessions', {
            headers: { 'Accept': 'application/json' }
        });
        const raw = await resp.json();

        status && (status.textContent = "Executant pipeline Python...");

        // 🔥 Conversió correcta: JS Array → Python List
        const pyData = pyodide.toPy(raw);

        // 🔥 Pasar al entorno Python como objeto válido
        pyodide.globals.set("raw_json", pyData);

        // Ejecutar el pipeline de Python
        pyodide.runPython(`result = run_pipeline(raw_json)`);

        // Convertir el resultado Python → JSON
        const out_json = pyodide.runPython(`import json; json.dumps(result)`);
        const parsed = JSON.parse(out_json);

        // Insertar imágenes generadas
        document.getElementById('img_cm').src = parsed.images.confusion_matrix || '';
        document.getElementById('img_roc').src = parsed.images.roc_curve || '';
        document.getElementById('img_feat').src = parsed.images.feature_importances || '';
        document.getElementById('img_hist').src = parsed.images.session_hist || '';
        document.getElementById('img_dau').src = parsed.images.dau || '';

        // Mostrar métricas
        document.getElementById('metrics_text').textContent =
            JSON.stringify(parsed.metrics, null, 2);

        status && (status.textContent = "Llisto.");
    } catch (err) {
        console.error("Error en runMetrics:", err);
        const statusEl = document.querySelector('#metrics p');
        statusEl && (statusEl.textContent = "Error: " + err.toString());
    }
}

// Crida automàtica
runMetrics();
