import io, base64, json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    roc_auc_score, roc_curve, confusion_matrix
)
from sklearn.preprocessing import StandardScaler


# --------------------------------------------------
# UTILS
# --------------------------------------------------

def fig_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    data = base64.b64encode(buf.read()).decode('ascii')
    plt.close(fig)
    return f"data:image/png;base64,{data}"


# --------------------------------------------------
# DATA PREP
# --------------------------------------------------

def preparar_df(raw_json):
    df = pd.DataFrame(raw_json)

    # Parse dates safely
    df['startTime'] = pd.to_datetime(df.get('startTime', None), errors='coerce')
    df['endTime']   = pd.to_datetime(df.get('endTime', None), errors='coerce')

    # Session length
    df['session_length'] = (
        df['endTime'].astype('datetime64[ns]') -
        df['startTime'].astype('datetime64[ns]')
    ).dt.total_seconds().fillna(0)

    # numeric defaults
    numeric_cols = ['session_length','points_scored','n_attempts','errors','help_clicks']
    for c in numeric_cols:
        df[c] = pd.to_numeric(df.get(c, 0), errors='coerce').fillna(0)

    # returning player
    if 'returningPlayer' in df.columns:
        df['returning_player'] = df['returningPlayer'].fillna(0).astype(int)
    else:
        counts = df.groupby('user_id')['session_id'].nunique()
        df['returning_player'] = df['user_id'].map(lambda u: 1 if counts.get(u,0) > 1 else 0).astype(int)

    df['success'] = (df['points_scored'] > 0).astype(int)

    df['date'] = df['startTime'].dt.date

    return df



# --------------------------------------------------
# TRAINING
# --------------------------------------------------

def entrenar_i_avaluar(df):
    """
    Entrena un modelo RandomForest y genera métricas + imágenes.
    """

    features = [
        "session_length",
        "points_scored",
        "errors",
        "n_attempts",
        "help_clicks",
        "success"
    ]

    X = df[features]
    y = df["returning_player"]

    # Poco data → evitar crash
    if len(df) < 10 or y.nunique() < 2:
        return {
            "metrics": {
                "accuracy": None,
                "precision": None,
                "recall": None,
                "roc_auc": None,
            },
            "images": {}
        }

    # Escalado
    scaler = StandardScaler()
    Xs = scaler.fit_transform(X)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        Xs, y, test_size=0.2, random_state=42, stratify=y
    )

    # Modelo
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Predict
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    # Métricas
    results = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_proba)),
    }

    # -------------------------
    # Graficos
    # -------------------------

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    fig1, ax1 = plt.subplots(figsize=(4,4))
    ax1.imshow(cm, cmap='Blues')
    ax1.set_title("Confusion matrix")
    ax1.set_xlabel("Predicted")
    ax1.set_ylabel("Actual")
    for (i, j), val in np.ndenumerate(cm):
        ax1.text(j, i, val, ha="center", va="center")
    cm_img = fig_to_base64(fig1)

    # ROC
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    fig2, ax2 = plt.subplots()
    ax2.plot(fpr, tpr, label=f"AUC={results['roc_auc']:.3f}")
    ax2.plot([0,1],[0,1],'--')
    ax2.set_title("ROC Curve")
    ax2.legend()
    roc_img = fig_to_base64(fig2)

    # Feature importances
    importances = model.feature_importances_
    fig3, ax3 = plt.subplots()
    ax3.barh(features, importances)
    ax3.set_title("Feature Importances")
    feat_img = fig_to_base64(fig3)

    # Histograma duracion
    fig4, ax4 = plt.subplots()
    ax4.hist(df["session_length"], bins=50)
    ax4.set_title("Durada Sessió (s)")
    hist_img = fig_to_base64(fig4)

    # DAU
    dau = df.groupby("date")["user_id"].nunique()
    fig5, ax5 = plt.subplots(figsize=(8,3))
    dau.plot(ax=ax5)
    ax5.set_title("DAU")
    dau_img = fig_to_base64(fig5)

    return {
        "metrics": results,
        "images": {
            "confusion_matrix": cm_img,
            "roc_curve": roc_img,
            "feature_importances": feat_img,
            "session_hist": hist_img,
            "dau": dau_img
        }
    }


# --------------------------------------------------
# ENTRYPOINT
# --------------------------------------------------

def run_pipeline(raw_json):
    df = preparar_df(raw_json)
    return entrenar_i_avaluar(df)
