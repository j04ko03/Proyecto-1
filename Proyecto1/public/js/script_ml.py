import base64
import io
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix, roc_curve, auc


# ======================================================================
# Convertir figures a base64
# ======================================================================
def fig_to_base64():
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)
    return "data:image/png;base64," + base64.b64encode(buf.read()).decode()


# ======================================================================
# 1) Convertir JSON a DataFrame
# ======================================================================
def json_to_df(raw_json):
    df = pd.DataFrame(raw_json)

    expected = [
        "user_id","session_id","session_date",
        "startTime","endTime","session_length",
        "level_reached","points_scored","errors",
        "n_attempts","help_clicks"
    ]
    for col in expected:
        if col not in df.columns:
            df[col] = 0

    df["session_date"] = pd.to_datetime(df["session_date"], errors="coerce")
    df["startTime"] = pd.to_datetime(df["startTime"], errors="coerce")
    df["endTime"] = pd.to_datetime(df["endTime"], errors="coerce")

    df["session_length"] = (df["endTime"] - df["startTime"]).dt.total_seconds()

    df = df.dropna(subset=["user_id", "session_id"])
    df = df[df["session_length"] > 0]

    num_cols = ["session_length","level_reached","points_scored",
                "errors","n_attempts","help_clicks"]

    for c in num_cols:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)

    # Retenció
    counts = df.groupby("user_id")["session_id"].nunique()
    df["returning_player"] = df["user_id"].map(lambda u: 1 if counts[u] > 1 else 0)

    df["churn_rate"] = 1 - df["returning_player"]

    df["day"] = df["session_date"].dt.date
    dau = df.groupby("day")["user_id"].nunique()

    df["month"] = df["session_date"].dt.to_period("M")
    mau = df.groupby("month")["user_id"].nunique()

    return df, dau, mau


# ======================================================================
# 2) Gràfics robustos
# ======================================================================
def generar_grafics(df, dau, mau):
    images = {}

    # Histograma punts
    plt.figure(figsize=(6,4))
    unique_vals = df["points_scored"].nunique()
    bins = max(unique_vals, 20)   # <- assegura 20 o més
    plt.hist(df["points_scored"], bins=bins)
    plt.title("Distribució de puntuacions")
    images["points_hist"] = fig_to_base64()
    plt.close()

    # Errors per nivell
    plt.figure(figsize=(6,4))
    if df["errors"].sum() == 0:
        plt.bar(["Cap error"], [1])
    else:
        lvl = df.groupby("level_reached")["errors"].mean()
        plt.bar(lvl.index.astype(str), lvl.values)
    plt.title("Errors mitjans per nivell")
    images["errors_per_level"] = fig_to_base64()
    plt.close()

    # Scatter intents vs points (jitter)
    plt.figure(figsize=(6,4))
    jitter_x = df["n_attempts"] + np.random.normal(0, 0.05, len(df))
    jitter_y = df["points_scored"] + np.random.normal(0, 0.05, len(df))
    plt.scatter(jitter_x, jitter_y, s=30)
    plt.title("Intents vs Puntuació (amb jitter)")
    images["scatter_attempts_points"] = fig_to_base64()
    plt.close()

    # DAU
    plt.figure(figsize=(6,4))
    plt.plot(dau.index.astype(str), dau.values, marker="o")
    plt.xticks(rotation=45)
    plt.title("DAU")
    images["DAU"] = fig_to_base64()
    plt.close()

    # MAU
    plt.figure(figsize=(6,4))
    plt.plot(mau.index.astype(str), mau.values, marker="o")
    plt.xticks(rotation=45)
    plt.title("MAU")
    images["MAU"] = fig_to_base64()
    plt.close()

    return images


# ======================================================================
# 3) Model predictiu segur
# ======================================================================
def model_predictiu(df):
    images = {}

    features = ["session_length","points_scored","errors","n_attempts","help_clicks"]
    X = df[features]
    y = df["churn_rate"].astype(int)

    # --------------------------
    # Confusion matrix
    # --------------------------
    plt.figure(figsize=(5,4))
    if len(np.unique(y)) < 2:
        plt.imshow([[len(y), 0],[0, 0]], cmap="viridis")
        plt.title("Confusion matrix (una sola classe)")
        plt.colorbar()
        images["confusion_matrix"] = fig_to_base64()
        plt.close()

        # ROC i FI no disponibles
        plt.figure(figsize=(5,4))
        plt.plot([0,1], [0,1])
        plt.title("ROC no disponible")
        images["roc_curve"] = fig_to_base64()
        plt.close()

        plt.figure(figsize=(6,4))
        plt.bar(features, [0]*len(features))
        plt.xticks(rotation=45)
        plt.title("Feature importance no disponible")
        images["FEATURE IMPORTANCE"] = fig_to_base64()
        plt.close()

        return {"roc_auc": None}, images

    # --------------------------
    # Si hi ha 2 classes
    # --------------------------
    model = RandomForestClassifier()
    model.fit(X, y)
    preds = model.predict(X)

    cm = confusion_matrix(y, preds)

    plt.imshow(cm, cmap="viridis")
    plt.title("Confusion matrix")
    plt.colorbar()
    images["CONFUSION MATRIX"] = fig_to_base64()
    plt.close()

    # ROC
    probs = model.predict_proba(X)[:,1]
    fpr, tpr, _ = roc_curve(y, probs)
    roc_auc = auc(fpr, tpr)

    plt.figure(figsize=(5,4))
    plt.plot(fpr, tpr, label=f"AUC={roc_auc:.2f}")
    plt.legend()
    plt.title("ROC curve")
    images["ROC CURVE"] = fig_to_base64()
    plt.close()

    # Feature importance
    plt.figure(figsize=(6,4))
    plt.bar(features, model.feature_importances_)
    plt.xticks(rotation=45)
    plt.title("Feature Importances")
    images["FEATURE IMPORTANCES"] = fig_to_base64()
    plt.close()

    return {"roc_auc": float(roc_auc)}, images


# ======================================================================
# 4) RUN PIPELINE (la funció que faltava!)
# ======================================================================
def run_pipeline(raw_json):
    df, dau, mau = json_to_df(raw_json)

    imgs_basic = generar_grafics(df, dau, mau)
    metrics_model, imgs_model = model_predictiu(df)

    df = df.copy()
    df["session_date"] = df["session_date"].astype(str)
    df["startTime"] = df["startTime"].astype(str)
    df["endTime"] = df["endTime"].astype(str)
    df["day"] = df["day"].astype(str)
    df["month"] = df["month"].astype(str)

    return {
        "metrics": {
            "player_count": int(df["user_id"].nunique()),
            "retention_rate": float(df["returning_player"].mean()),
            "churn_rate": float(df["churn_rate"].mean()),
            "average_session_length": float(df["session_length"].mean()),
            "dau_count": {str(k): int(v) for k,v in dau.to_dict().items()},
            "mau_count": {str(k): int(v) for k,v in mau.to_dict().items()}
        },
        "model_metrics": metrics_model,
        "images": {**imgs_basic, **imgs_model},
        "cleaned_df": df.to_dict(orient="records")
    }
