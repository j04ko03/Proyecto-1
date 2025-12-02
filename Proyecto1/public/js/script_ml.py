import pandas as pd
import matplotlib.pyplot as plt
import io
import base64

def json_to_df(raw_json):
    """
    Convierte la lista JSON en un DataFrame válido para el modelo.
    Asegura columnas numéricas y crea la columna success si falta.
    """
    df = pd.DataFrame(raw_json)

    # Asegurar que todas las columnas esperadas existan
    expected = [
        "session_length",
        "points_scored",
        "errors",
        "n_attempts",
        "help_clicks"
    ]

    for col in expected:
        if col not in df.columns:
            df[col] = 0   # si no existe, se crea con 0

    # Convertir a numérico
    for col in expected:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Crear etiqueta de éxito
    # regla ejemplo: éxito si puntos > 0 y errores == 0
    if "success" not in df.columns:
        df["success"] = (df["points_scored"] > 0).astype(int)

    return df


def entrenar_i_avaluar(df):
    """
    Ejemplo simplificado: solo genera métricas falsas
    para confirmar que el pipeline funciona sin errores.
    """

    metrics = {
        "total_sessions": len(df),
        "avg_session_length": df["session_length"].mean(),
        "avg_points": df["points_scored"].mean(),
        "error_rate": df["errors"].mean(),
        "success_rate": df["success"].mean()
    }

    # generar una imagen simple para probar
    fig, ax = plt.subplots()
    ax.hist(df["points_scored"])
    buf = io.BytesIO()
    fig.savefig(buf, format="png")
    buf.seek(0)
    img_b64 = "data:image/png;base64," + base64.b64encode(buf.read()).decode()
    plt.close(fig)

    return metrics, {"session_hist": img_b64}


def run_pipeline(raw_json):
    df = json_to_df(raw_json)
    metrics, images = entrenar_i_avaluar(df)

    # retornar estructura compatible con JS
    return {
        "metrics": metrics,
        "images": images
    }
