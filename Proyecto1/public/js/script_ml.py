# pipeline_completo.py
import base64
import io
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import confusion_matrix, roc_curve, auc, accuracy_score, precision_score, recall_score, f1_score
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.model_selection import train_test_split

# ======================================================================
# Util: convertir figura actual a base64 (PNG)
# ======================================================================
def fig_to_base64():
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)
    encoded = "data:image/png;base64," + base64.b64encode(buf.read()).decode()
    plt.close()
    return encoded

# ======================================================================
# 1) Convertir JSON a DataFrame y calcular DAU/MAU, retención, churn
# ======================================================================
def json_to_df(raw_json, churn_days=7):
    df = pd.DataFrame(raw_json)
    expected = ["user_id","session_id","session_date","startTime","endTime","session_length",
                "level_reached","points_scored","errors","n_attempts","help_clicks"]
    for col in expected:
        if col not in df.columns:
            df[col] = 0

    df["session_date"] = pd.to_datetime(df["session_date"], errors="coerce")
    df["startTime"] = pd.to_datetime(df["startTime"], errors="coerce")
    df["endTime"] = pd.to_datetime(df["endTime"], errors="coerce")

    if df["session_length"].isnull().all() or df["session_length"].dtype == object:
        df["session_length"] = (df["endTime"] - df["startTime"]).dt.total_seconds()

    df = df.dropna(subset=["user_id","session_id"])
    df = df[df["session_length"] > 0]

    num_cols = ["session_length","level_reached","points_scored","errors","n_attempts","help_clicks"]
    for c in num_cols:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)

    # Última sesión por jugador
    last_session = df.groupby("user_id")["session_date"].max()
    max_date = df["session_date"].max()

    # Definir churners: inactividad > churn_days
    df["churn_rate"] = df["user_id"].map(lambda u: 1 if (max_date - last_session[u]).days >= churn_days else 0)

    df["returning_player"] = 1 - df["churn_rate"]

    df["day"] = df["session_date"].dt.date
    dau = df.groupby("day")["user_id"].nunique()
    df["month"] = df["session_date"].dt.to_period("M")
    mau = df.groupby("month")["user_id"].nunique()

    return df, dau, mau

# ======================================================================
# 2) Generar gráficos robustos (devuelven imágenes base64)
# ======================================================================
def generar_grafics(df, dau, mau):
    images = {}

    plt.figure(figsize=(6,4))
    plt.hist(df["session_length"], bins=50, edgecolor="black")
    plt.title("Distribución de Duración de Sesiones")
    plt.xlabel("Duración (segundos)")
    plt.ylabel("Frecuencia")
    images["session_length_hist"] = fig_to_base64()

    plt.figure(figsize=(6,4))
    unique_vals = df["points_scored"].nunique()
    bins = max(unique_vals, 20)
    plt.hist(df["points_scored"], bins=bins)
    plt.title("Distribución de puntuaciones")
    plt.xlabel("Puntuación")
    plt.ylabel("Frecuencia")
    images["points_hist"] = fig_to_base64()

    plt.figure(figsize=(6,4))
    plt.hist(df["errors"], bins=20, edgecolor="black")
    plt.title("Distribución de errores")
    plt.xlabel("Errores")
    plt.ylabel("Frecuencia")
    images["errors_hist"] = fig_to_base64()

    plt.figure(figsize=(6,4))
    jitter_x = df["n_attempts"] + np.random.normal(0, 0.05, len(df))
    jitter_y = df["points_scored"] + np.random.normal(0, 0.05, len(df))
    plt.scatter(jitter_x, jitter_y, s=30, alpha=0.7)
    plt.title("Intentos vs Puntuación (con jitter)")
    plt.xlabel("Intentos")
    plt.ylabel("Puntuación")
    images["scatter_attempts_points"] = fig_to_base64()

    plt.figure(figsize=(6,4))
    if df["errors"].sum() == 0:
        plt.bar(["Sin errores"], [1])
        plt.title("Errors mitjans per nivell (no hay errores registrados)")
    else:
        lvl = df.groupby("level_reached")["errors"].mean()
        plt.bar(lvl.index.astype(str), lvl.values)
        plt.title("Errores medios por nivel")
        plt.xlabel("Nivel")
        plt.ylabel("Errores medios")
    images["errors_per_level"] = fig_to_base64()

    plt.figure(figsize=(6,4))
    plt.plot(dau.index.astype(str), dau.values, marker="o")
    plt.xticks(rotation=45)
    plt.title("DAU (Daily Active Users)")
    plt.xlabel("Día")
    plt.ylabel("Usuarios activos")
    images["dau"] = fig_to_base64()

    plt.figure(figsize=(6,4))
    plt.plot(mau.index.astype(str), mau.values, marker="o")
    plt.xticks(rotation=45)
    plt.title("MAU (Monthly Active Users)")
    plt.xlabel("Mes")
    plt.ylabel("Usuarios activos")
    images["mau"] = fig_to_base64()

    return images

# ======================================================================
# 3) Modelo predictivo con gráficos completos (árbol, ROC, importancia)
# ======================================================================
def model_predictiu(df, test_size=0.2, random_state=42):
    images = {}
    features = ["session_length","points_scored","errors","n_attempts","help_clicks"]
    for f in features:
        if f not in df.columns:
            df[f] = 0

    X = df[features].fillna(0).values
    y = df["churn_rate"].astype(int).values

    if len(np.unique(y)) < 2:
        # Solo una clase: no podemos entrenar modelo
        plt.figure(figsize=(5,4))
        plt.plot([0,1],[0,1])
        plt.title("ROC no disponible (una sola clase)")
        images["roc_curve"] = fig_to_base64()
        return {"roc_auc": None}, images

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    # Decision Tree
    tree = DecisionTreeClassifier(max_depth=3, random_state=random_state)
    tree.fit(X_train, y_train)
    y_pred_tree = tree.predict(X_test)
    y_prob_tree = tree.predict_proba(X_test)[:,1]

    plt.figure(figsize=(20,10))
    plot_tree(tree, feature_names=features, class_names=["No Churn","Churn"], filled=True, rounded=True, fontsize=12)
    images["decision_tree_plot"] = fig_to_base64()

    plt.figure(figsize=(6,4))
    plt.bar(features, tree.feature_importances_)
    plt.xticks(rotation=45)
    plt.title("Feature Importances (Decision Tree)")
    images["tree_feature_importances"] = fig_to_base64()

    fpr_t, tpr_t, _ = roc_curve(y_test, y_prob_tree)
    roc_auc_tree = auc(fpr_t, tpr_t)
    plt.figure(figsize=(6,4))
    plt.plot(fpr_t, tpr_t, label=f"AUC={roc_auc_tree:.2f}")
    plt.plot([0,1],[0,1], 'k--')
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve (Decision Tree)")
    plt.legend()
    images["roc_curve_tree"] = fig_to_base64()

    # Random Forest
    rf = RandomForestClassifier(random_state=random_state)
    rf.fit(X_train, y_train)
    y_pred_rf = rf.predict(X_test)
    y_prob_rf = rf.predict_proba(X_test)[:,1]

    plt.figure(figsize=(5,4))
    cm_rf = confusion_matrix(y_test, y_pred_rf)
    plt.imshow(cm_rf, cmap="viridis")
    plt.title("Confusion Matrix (Random Forest)")
    plt.colorbar()
    images["confusion_matrix_rf"] = fig_to_base64()

    fpr_rf, tpr_rf, _ = roc_curve(y_test, y_prob_rf)
    roc_auc_rf = auc(fpr_rf, tpr_rf)
    plt.figure(figsize=(6,4))
    plt.plot(fpr_rf, tpr_rf, label=f"AUC={roc_auc_rf:.2f}")
    plt.plot([0,1],[0,1],'k--')
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve (Random Forest)")
    plt.legend()
    images["roc_curve_rf"] = fig_to_base64()

    plt.figure(figsize=(6,4))
    plt.bar(features, rf.feature_importances_)
    plt.xticks(rotation=45)
    plt.title("Feature Importances (Random Forest)")
    images["feature_importances_rf"] = fig_to_base64()

    metrics = {
        "decision_tree": {"roc_auc": float(roc_auc_tree)},
        "random_forest": {"roc_auc": float(roc_auc_rf)},
        "train_size": len(y_train),
        "test_size": len(y_test)
    }

    return metrics, images

# ======================================================================
# 4) RUN PIPELINE
# ======================================================================
def run_pipeline(raw_json):
    df, dau, mau = json_to_df(raw_json)
    imgs_basic = generar_grafics(df, dau, mau)
    metrics_model, imgs_model = model_predictiu(df)

    df_out = df.copy()
    for col in ["session_date","startTime","endTime"]:
        if col in df_out.columns:
            df_out[col] = df_out[col].astype(str)
    if "day" in df_out.columns:
        df_out["day"] = df_out["day"].astype(str)
    if "month" in df_out.columns:
        df_out["month"] = df_out["month"].astype(str)

    metrics = {
        "player_count": int(df["user_id"].nunique()),
        "retention_rate": float(df["returning_player"].mean()),
        "churn_rate": float(df["churn_rate"].mean()),
        "average_session_length": float(df["session_length"].mean()),
        "dau_count": {str(k): int(v) for k,v in dau.to_dict().items()},
        "mau_count": {str(k): int(v) for k,v in mau.to_dict().items()}
    }

    return {"metrics": metrics, "model_metrics": metrics_model,
            "images": {**imgs_basic, **imgs_model},
            "cleaned_df": df_out.to_dict(orient="records")}
