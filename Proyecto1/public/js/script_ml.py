import pandas as pd
import matplotlib.pyplot as plt
import io
import base64
import numpy as np

def _fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    buf.seek(0)
    img = "data:image/png;base64," + base64.b64encode(buf.read()).decode()
    plt.close(fig)
    return img

# --------------------------------------------------------
# 1) Convertir JSON → DataFrame
# --------------------------------------------------------
def json_to_df(raw_json):
    df = pd.DataFrame(raw_json)

    expected = ["session_length","points_scored","errors","n_attempts","help_clicks"]
    for col in expected:
        if col not in df.columns:
            df[col] = 0
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Etiqueta de éxito para demo
    df["success"] = (df["points_scored"] > 0).astype(int)
    return df

# --------------------------------------------------------
# 2) Entrenar modelo simple + generar imágenes DEMO
# --------------------------------------------------------
def entrenar_i_avaluar(df):

    metrics = {
        "total_sessions": len(df),
        "avg_session_length": df["session_length"].mean(),
        "avg_points": df["points_scored"].mean(),
        "error_rate": df["errors"].mean(),
        "success_rate": df["success"].mean()
    }

    images = {}

    # ----------------------------------------------------
    # Imagen 1 — Histograma real
    # ----------------------------------------------------
    fig, ax = plt.subplots()
    ax.hist(df["points_scored"])
    ax.set_title("Histograma points_scored")
    images["session_hist"] = _fig_to_base64(fig)

    # ----------------------------------------------------
    # Imagen 2 — Matriz de confusión FAKE
    # ----------------------------------------------------
    fig, ax = plt.subplots()
    ax.imshow([[30, 5], [4, 20]])
    ax.set_title("Confusion matrix DEMO")
    images["confusion_matrix"] = _fig_to_base64(fig)

    # ----------------------------------------------------
    # Imagen 3 — ROC curve FAKE
    # ----------------------------------------------------
    fig, ax = plt.subplots()
    ax.plot([0, 0.1, 1], [0, 0.9, 1])
    ax.set_title("ROC DEMO")
    images["roc_curve"] = _fig_to_base64(fig)

    # ----------------------------------------------------
    # Imagen 4 — Feature importance DEMO
    # ----------------------------------------------------
    features = ["session_length","points_scored","errors","n_attempts","help_clicks"]
    vals = np.random.rand(len(features))

    fig, ax = plt.subplots()
    ax.bar(features, vals)
    ax.set_title("Feature importance DEMO")
    plt.xticks(rotation=45)
    images["feature_importances"] = _fig_to_base64(fig)

    # ----------------------------------------------------
    # Imagen 5 — DAU DEMO
    # ----------------------------------------------------
    dau = df.groupby(df.index // 8).size()

    fig, ax = plt.subplots()
    ax.plot(dau.index, dau.values)
    ax.set_title("DAU DEMO")
    images["dau"] = _fig_to_base64(fig)

    return metrics, images


# --------------------------------------------------------
# 3) Pipeline principal
# --------------------------------------------------------
def run_pipeline(raw_json):
    df = json_to_df(raw_json)
    metrics, images = entrenar_i_avaluar(df)

    return {
        "metrics": metrics,
        "images": images
    }
