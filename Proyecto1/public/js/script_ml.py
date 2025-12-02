import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import io, base64
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix, roc_curve, auc, accuracy_score

# ============================================
# Utility → figura → base64
# ============================================
def _fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)
    img = "data:image/png;base64," + base64.b64encode(buf.read()).decode()
    plt.close(fig)
    return img


# ============================================
# 1️⃣ Cargar y preparar datos
# ============================================
def json_to_df(raw_json):

    df = pd.DataFrame(raw_json)

    # Seguridad: columnas que pueden faltar
    expected = [
        "user_id", "session_id", "session_date",
        "startTime", "endTime",
        "session_length","level_reached",
        "points_scored","errors","n_attempts","help_clicks"
    ]
    for col in expected:
        if col not in df.columns:
            df[col] = 0

    # Convertir fechas
    df["session_date"] = pd.to_datetime(df["session_date"], errors="coerce")
    df["startTime"] = pd.to_datetime(df["startTime"], errors="coerce")
    df["endTime"] = pd.to_datetime(df["endTime"], errors="coerce")

    # Duración real
    df["session_length"] = (df["endTime"] - df["startTime"]).dt.total_seconds()

    df = df.drop_duplicates(subset=["session_id"])
    df = df.dropna(subset=["user_id", "session_id", "session_length"])
    df = df[df["session_length"] > 0]
    df = df[df["session_length"] < 3*3600]

    # Numericos seguros
    numeric_cols = ["session_length", "level_reached", "points_scored",
                    "errors", "n_attempts", "help_clicks"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    df["success"] = (df["points_scored"] > 0).astype(int)

    df["player_count"] = df["user_id"].nunique()

    session_counts = df.groupby("user_id")["session_id"].nunique()
    df["returning_player"] = df["user_id"].map(lambda u: 1 if session_counts[u] > 1 else 0)

    df["retention_rate"] = df["returning_player"].mean()
    df["churn_rate"] = 1 - df["returning_player"].mean()

    df["day"] = df["session_date"].dt.date
    dau = df.groupby("day")["user_id"].nunique()

    df["month"] = df["session_date"].dt.to_period("M")
    mau = df.groupby("month")["user_id"].nunique()

    return df, dau, mau


# ============================================
# 2️⃣ Gráficos (con manejo de datos mínimos)
# ============================================
def generar_grafics(df, dau, mau):

    images = {}

    # ---------------------------
    # Histograma puntuaciones (aunque sea 1 punto)
    # ---------------------------
    fig, ax = plt.subplots()
    ax.hist(df["points_scored"], bins=max(1, min(10, df["points_scored"].nunique())))
    ax.set_title("Distribució de puntuacions")
    images["points_hist"] = _fig_to_base64(fig)

    # ---------------------------
    # Errors per nivell
    # ---------------------------
    err = df.groupby("level_reached")["errors"].mean()

    fig, ax = plt.subplots()
    ax.bar(err.index.astype(str), err.values)
    ax.set_title("Errors mitjans per nivell (mínim 1)")
    images["errors_per_level"] = _fig_to_base64(fig)

    # ---------------------------
    # Scatter intents vs punts (jitter si todos iguales)
    # ---------------------------
    x = df["n_attempts"].astype(float)
    y = df["points_scored"].astype(float)

    if x.nunique() <= 1:
        x = x + np.random.normal(0, 0.1, size=len(x))  # JITTER

    if y.nunique() <= 1:
        y = y + np.random.normal(0, 0.1, size=len(y))  # JITTER

    fig, ax = plt.subplots()
    ax.scatter(x, y)
    ax.set_title("Intents vs Puntuació (amb jitter)")
    images["scatter_attempts_points"] = _fig_to_base64(fig)

    # ---------------------------
    # DAU (si hay 1 día, mostrar punto claro)
    # ---------------------------
    fig, ax = plt.subplots()
    if len(dau) <= 1:
        ax.scatter([0], dau.values, s=100)
        ax.set_xticks([0])
        ax.set_xticklabels([str(dau.index[0])])
        ax.set_title("DAU (solo 1 día)")
    else:
        ax.plot(dau.index.astype(str), dau.values, marker="o")
        ax.set_title("DAU - Jugadors actius per dia")
    images["dau"] = _fig_to_base64(fig)

    # ---------------------------
    # MAU (si hay 1 mes, mostrar barra)
    # ---------------------------
    fig, ax = plt.subplots()
    if len(mau) <= 1:
        ax.bar([str(mau.index[0])], mau.values)
        ax.set_title("MAU (solo 1 mes)")
    else:
        ax.plot(mau.index.astype(str), mau.values, marker="o")
        ax.set_title("MAU - Jugadors actius per mes")
    images["mau"] = _fig_to_base64(fig)

    return images


# ============================================
# 3️⃣ Modelo predictivo (adaptado para 1 sola clase)
# ============================================
def model_predictiu(df):

    features = ["session_length", "points_scored", "errors", "n_attempts", "help_clicks"]
    X = df[features]
    y = df["returning_player"]

    images = {}

    # 🚨 Caso: solo una clase en y → evitar error sklearn
    if y.nunique() < 2:
        # Accuracy trivial
        accuracy = 1.0
        roc_auc = 0.0

        # Imagen dummy matriz confusión
        fig, ax = plt.subplots()
        ax.imshow([[len(y), 0], [0, 0]])
        ax.set_title("Confusion matrix (no hay clase positiva)")
        images["confusion_matrix"] = _fig_to_base64(fig)

        # Imagen dummy ROC
        fig, ax = plt.subplots()
        ax.plot([0, 1], [0, 1])
        ax.set_title("ROC no disponible (solo una clase)")
        images["roc_curve"] = _fig_to_base64(fig)

        # Imagen dummy feature importance
        fig, ax = plt.subplots()
        ax.bar(features, np.zeros(len(features)))
        ax.set_title("Feature importance no disponible")
        plt.xticks(rotation=45)
        images["feature_importances"] = _fig_to_base64(fig)

        return {
            "accuracy": accuracy,
            "roc_auc": roc_auc
        }, images

    # -------------------------------------------------------
    # 🚀 Entrenamiento normal (dos clases)
    # -------------------------------------------------------
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25)

    model = RandomForestClassifier()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    # ROC
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)

    # Matriz confusión
    fig, ax = plt.subplots()
    ax.imshow(cm)
    ax.set_title("Matriu de confusió")
    images["confusion_matrix"] = _fig_to_base64(fig)

    # ROC
    fig, ax = plt.subplots()
    ax.plot(fpr, tpr)
    ax.set_title(f"Corba ROC (AUC={roc_auc:.2f})")
    images["roc_curve"] = _fig_to_base64(fig)

    # Feature importance
    fig, ax = plt.subplots()
    ax.bar(features, model.feature_importances_)
    ax.set_title("Importància de característiques")
    plt.xticks(rotation=45)
    images["feature_importances"] = _fig_to_base64(fig)

    return {
        "accuracy": float(accuracy),
        "roc_auc": float(roc_auc)
    }, images


# ============================================
# 4️⃣ Pipeline final
# ============================================
def run_pipeline(raw_json):

    df, dau, mau = json_to_df(raw_json)

    # Gráficos
    images_data = generar_grafics(df, dau, mau)

    # Modelo
    model_metrics, model_images = model_predictiu(df)

    print("IMAGES KEYS:", list(images_data.keys()))
    print("MODEL IMG KEYS:", list(model_images.keys()))

    # Convertir columnas no-serializables
    df = df.copy()
    df["session_date"] = df["session_date"].astype(str)
    df["startTime"] = df["startTime"].astype(str)
    df["endTime"] = df["endTime"].astype(str)
    df["day"] = df["day"].astype(str)
    df["month"] = df["month"].astype(str)

    return {
        "metrics": {
            "player_count": int(df["player_count"].iloc[0]),
            "retention_rate": float(df["retention_rate"].iloc[0]),
            "churn_rate": float(df["churn_rate"].iloc[0]),
            "average_session_length": float(df["session_length"].mean()),
            "dau_count": {str(k): int(v) for k, v in dau.to_dict().items()},
            "mau_count": {str(k): int(v) for k, v in mau.to_dict().items()}
        },
        "model_metrics": model_metrics,
        "images": {**images_data, **model_images},
        "cleaned_df": df.to_dict(orient="records")
    }
