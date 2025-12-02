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

        // 🔥 Conversió correcta: JS Array/Object → Python dict/list
        const pyData = pyodide.toPy(raw);
        pyodide.globals.set("raw_json", pyData);

        // Executar el pipeline
        pyodide.runPython(`result = run_pipeline(raw_json)`);

        // Convertir Python → JSON JS
        const out_json = pyodide.runPython(`
            import json
            json.dumps(result)
        `);

        const parsed = JSON.parse(out_json);

        console.log("IMAGES KEYS:", Object.keys(parsed.images));

        // ============================
        // 🔥 NOVETAT: MOSTRAR TOTES LES IMATGES DINÀMICAMENT
        // ============================
        const container = document.getElementById("all_images");
        if (container) {
            container.innerHTML = "";

            for (const [key, b64] of Object.entries(parsed.images)) {
                const div = document.createElement("div");
                div.className = "metric-box";

                const title = document.createElement("h3");
                title.textContent = key.replaceAll("_", " ");

                const img = document.createElement("img");
                img.src = b64;
                img.className = "metric-img";

                div.appendChild(title);
                div.appendChild(img);
                container.appendChild(div);
            }
        }

        // ============================
        // 🔥 Mantinc els teus <img> existents
        // ============================
        const safe = (name) => parsed.images[name] || "";

        const ids = {
            img_cm: "confusion_matrix",
            img_roc: "roc_curve",
            img_feat: "feature_importances",
            img_hist: "session_hist",
            img_dau: "dau"
        };

        for (const [htmlId, imgKey] of Object.entries(ids)) {
            const el = document.getElementById(htmlId);
            if (el) el.src = safe(imgKey);
        }

        // Mostrar mètriques
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
