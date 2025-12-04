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
    jitter_x = df["n_attempts"] + np.random.normal(0, 0.2, len(df))
    jitter_y = df["points_scored"] + np.random.normal(0, 0.2, len(df))
    plt.scatter(jitter_x, jitter_y, s=30)
    plt.title("Intents vs Puntuació (amb jitter)")
    images["scatter_attempts_points"] = fig_to_base64()
    plt.close()

    # DAU
    plt.figure(figsize=(6,4))
    plt.plot(dau.index.astype(str), dau.values, marker="o")
    plt.xticks(rotation=45)
    plt.title("DAU")
    images["Dau"] = fig_to_base64()
    plt.close()

    # MAU
    plt.figure(figsize=(6,4))
    plt.plot(mau.index.astype(str), mau.values, marker="o")
    plt.xticks(rotation=45)
    plt.title("MAU")
    images["Mau"] = fig_to_base64()
    plt.close()

    return images


# ======================================================================
# 3) Model predictiu segur - SOLO ROC Y FEATURE IMPORTANCE
# ======================================================================
def model_predictiu(df):
    images = {}
    
    # 1. Definir características (features) que usaremos
    features = ["session_length", "points_scored", "errors", 
                "n_attempts", "help_clicks"]
    
    # Asegurar que todas las features existen en el DataFrame
    for feature in features:
        if feature not in df.columns:
            df[feature] = 0  # Si no existe, crear con valor 0
    
    # 2. Preparar datos de entrada (X) y objetivo (y)
    X = df[features]
    y = df["churn_rate"].astype(int)  # Convertir a entero (0 o 1)
    
    # 3. Verificar si tenemos suficientes clases para calcular ROC
    if len(np.unique(y)) < 2:
        # Caso: solo una clase (todos 0 o todos 1)
        print("⚠️ Solo hay una clase en los datos. No se puede calcular ROC.")
        
        # Crear gráfico ROC vacío
        plt.figure(figsize=(6, 5))
        plt.plot([0, 1], [0, 1], linestyle='--', color='gray', label='Modelo aleatorio')
        plt.text(0.5, 0.5, 'ROC no disponible\n(Solo hay una clase en los datos)', 
                ha='center', va='center', fontsize=12)
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('Curva ROC')
        plt.legend()
        images["roc_curve"] = fig_to_base64()
        plt.close()
        
        # Crear gráfico Feature Importance vacío
        plt.figure(figsize=(8, 5))
        plt.bar(features, [0] * len(features), color='lightgray')
        plt.xticks(rotation=45, ha='right')
        plt.ylabel('Importancia')
        plt.title('Importancia de Características')
        plt.tight_layout()
        images["feature_importances"] = fig_to_base64()
        plt.close()
        
        return {"roc_auc": None, 
                "error": "Solo una clase en los datos"}, images
    
    # 4. Entrenar el modelo RandomForest
    print(f"✅ Entrenando RandomForest con {len(X)} muestras...")
    model = RandomForestClassifier(
        n_estimators=100,    # 100 árboles en el bosque
        random_state=42,     # Para reproducibilidad
        max_depth=5          # Limitar profundidad para evitar overfitting
    )
    
    # Entrenar el modelo (según instrucciones: usar todos los datos)
    model.fit(X, y)
    
    # 5. Obtener probabilidades para calcular ROC
    # Usamos predict_proba para obtener probabilidades (no solo 0/1)
    y_probs = model.predict_proba(X)[:, 1]  # Probabilidad de clase 1 (churn)
    
    # 6. Calcular curva ROC y AUC
    fpr, tpr, thresholds = roc_curve(y, y_probs)
    roc_auc = auc(fpr, tpr)
    
    # 7. Crear gráfico de la curva ROC
    plt.figure(figsize=(8, 6))
    
    # Dibujar la curva ROC
    plt.plot(fpr, tpr, color='darkorange', linewidth=2.5,
             label=f'RandomForest (AUC = {roc_auc:.3f})')
    
    # Línea de referencia (modelo aleatorio)
    plt.plot([0, 1], [0, 1], color='navy', linewidth=1.5, 
             linestyle='--', label='Modelo aleatorio (AUC = 0.5)')
    
    # Rellenar área bajo la curva
    plt.fill_between(fpr, tpr, alpha=0.2, color='darkorange')
    
    # Configurar ejes y título
    plt.xlim([-0.02, 1.02])
    plt.ylim([-0.02, 1.02])
    plt.xlabel('False Positive Rate (1 - Especificidad)', fontsize=12)
    plt.ylabel('True Positive Rate (Sensibilidad)', fontsize=12)
    plt.title('Curva ROC - Predicción de Abandono de Jugadores', fontsize=14, pad=15)
    plt.legend(loc="lower right", fontsize=11)
    plt.grid(True, alpha=0.3)
    
    # Añadir texto informativo
    plt.figtext(0.15, 0.75, 
                f'AUC = {roc_auc:.3f}\n'
                f'Muestras = {len(X)}\n'
                f'Clase 0: {(y == 0).sum()}\n'
                f'Clase 1: {(y == 1).sum()}',
                fontsize=10,
                bbox=dict(boxstyle="round,pad=0.5", 
                         facecolor="lightyellow", 
                         alpha=0.8,
                         edgecolor='orange'))
    
    # Guardar como imagen base64
    images["roc_curve"] = fig_to_base64()
    plt.close()
    
    # 8. Crear gráfico de Feature Importance
    importancias = model.feature_importances_
    
    # Ordenar de mayor a menor importancia
    indices = np.argsort(importancias)[::-1]
    features_ordenadas = [features[i] for i in indices]
    importancias_ordenadas = importancias[indices]
    
    plt.figure(figsize=(10, 6))
    
    # Crear gráfico de barras horizontales
    barras = plt.barh(range(len(features_ordenadas)), 
                     importancias_ordenadas,
                     color='steelblue', 
                     alpha=0.8,
                     height=0.7)
    
    # Etiquetas en el eje Y
    plt.yticks(range(len(features_ordenadas)), features_ordenadas, fontsize=11)
    plt.xlabel('Importancia Relativa', fontsize=12)
    plt.title('Importancia de Características para Predecir Churn', 
              fontsize=14, pad=15)
    
    # Añadir valores numéricos a las barras
    for i, (bar, importancia) in enumerate(zip(barras, importancias_ordenadas)):
        plt.text(importancia + 0.005, bar.get_y() + bar.get_height()/2,
                f'{importancia:.3f} ({importancia*100:.1f}%)',
                ha='left', va='center', fontsize=10)
    
    # Añadir línea vertical en la importancia promedio
    importancia_promedio = np.mean(importancias_ordenadas)
    plt.axvline(x=importancia_promedio, color='red', linestyle='--', 
                alpha=0.6, label=f'Promedio: {importancia_promedio:.3f}')
    plt.legend(loc='lower right')
    
    plt.grid(axis='x', alpha=0.3)
    plt.tight_layout()
    
    # Guardar como imagen base64
    images["feature_importances"] = fig_to_base64()
    plt.close()
    
    # 9. Información para la consola (opcional, para debugging)
    print(f"\n📊 RESULTADOS DEL MODELO:")
    print(f"   AUC-ROC: {roc_auc:.4f}")
    print(f"   Muestras totales: {len(X)}")
    print(f"   Distribución de clases: 0={(y == 0).sum()}, 1={(y == 1).sum()}")
    print(f"   Característica más importante: {features_ordenadas[0]} "
          f"({importancias_ordenadas[0]*100:.1f}%)")
    
    # 10. Retornar resultados
    return {"roc_auc": float(roc_auc),
            "n_samples": len(X),
            "best_feature": features_ordenadas[0],
            "best_feature_importance": float(importancias_ordenadas[0])}, images


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
