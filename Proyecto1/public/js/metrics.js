async function runMetrics() {
    const status = document.querySelector('#metrics p');
    try {
        status && (status.textContent = "Carregant Pyodide...", status.style.color = "#F28918");

        const pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.2/full/"
        });

        // status && (status.style.color = "#F28918");
/*Descargar los paquetes de python */
        status && (status.textContent = "Instal·lant dependències (micropip)...", status.style.color = "#F28918");
        await pyodide.loadPackage(['micropip']);
        const micropip = pyodide.pyimport('micropip');

        status && (status.textContent = "Instal·lant pandas, scikit-learn, matplotlib...", status.style.color = "#F28918");
        await micropip.install('pandas');
        await micropip.install('scikit-learn');
        await micropip.install('matplotlib');
/*------*/

/*Carga el script de python*/
        status && (status.textContent = "Carregant script ML...", status.style.color = "#F28918");
        const pyCodeResp = await fetch('/Proyecto-1/Proyecto1/public/js/script_ml.py');
        const pyCode = await pyCodeResp.text();
        pyodide.runPython(pyCode);

/*Obtener datos del servidor */
        status && (status.textContent = "Obtenint dades del servidor...", status.style.color = "#F28918");
        const resp = await fetch('/Proyecto-1/Proyecto1/public/metrics/sessions', {
            headers: { 'Accept': 'application/json' }
        });
        const raw = await resp.json();

/*Convierte los datos de javaScript en Python, asigna los datos a la varaible gloval raw_json
y llama a la funcion run_pipeline en
pyton que devuelve un diccionario con metriscas, graficos y DataFrame limpio*/
        status && (status.textContent = "Executant pipeline Python...", status.style.color = "#F28918");

        // 🔥 Conversió correcta: JS Array/Object → Python dict/list
        const pyData = pyodide.toPy(raw);
        pyodide.globals.set("raw_json", pyData);

        // Executar el pipeline
        pyodide.runPython(`result = run_pipeline(raw_json)`);

/* Convertir Python → JSON JS y lo parsea (parsed contiene todo lo que genero el pipeline
imagenes, base64, metricas y datos limpios)*/
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
/*Actuliza imagenes existente con los graficos especificos
y evita errores si la imagen no existe en el parse.images*/
        const ids = {
            img_cm: "confusion_matrix_tree",
            img_roc: "roc_curve_tree",
            img_feat: "tree_feature_importances",
            img_rf_cm: "confusion_matrix_rf",
            img_rf_roc: "roc_curve_rf",
            img_rf_feat: "feature_importances_rf",
            img_hist: "session_length_hist",
            img_dau: "dau"
        };

        for (const [htmlId, imgKey] of Object.entries(ids)) {
            const el = document.getElementById(htmlId);
            if (el) el.src = safe(imgKey);
        }

        // Mostrar mètriques
/*Convierte las metricas a JSON formateado y las muestra en un elemento metrics_text*/
        document.getElementById('metrics_text').textContent =
            JSON.stringify(parsed.metrics, null, 2);

/*Si algo falla en calquier paso, se captura con catch y ç
muestra el error en la pantalla y en la consola*/
        status && (status.textContent = "Llisto.");
    } catch (err) {
        console.error("Error en runMetrics:", err);
        const statusEl = document.querySelector('#metrics p');
        statusEl && (statusEl.textContent = "Error: " + err.toString());
    }
}

// Crida automàtica
/*Cargar las metricas */
runMetrics();
