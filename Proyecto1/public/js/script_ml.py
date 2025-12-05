import base64
import io
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.metrics import roc_curve, auc


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
# 3) Model predictiu con ÁRBOL DE DECISIÓN específico para ROC y FI
# ======================================================================
def model_predictiu(df):
    images = {}
    
    # Features para el modelo
    features = ["session_length", "points_scored", "errors", 
                "n_attempts", "help_clicks"]
    
    # Asegurar que existen las columnas
    for feature in features:
        if feature not in df.columns:
            df[feature] = 0
    
    X = df[features]
    y = df["churn_rate"].astype(int)
    
    # Verificar que tenemos al menos 2 clases
    unique_classes = np.unique(y)
    if len(unique_classes) < 2:
        print("⚠️ Solo hay una clase en los datos. No se puede calcular ROC.")
        
        # Gráfico ROC de error
        plt.figure(figsize=(5,4))
        plt.plot([0, 1], [0, 1], linestyle='--', color='gray')
        plt.text(0.5, 0.5, 'Solo una clase\nROC no disponible', 
                ha='center', va='center')
        plt.title("Curva ROC")
        images["roc_curve"] = fig_to_base64()
        plt.close()
        
        # Gráfico Feature Importance de error
        plt.figure(figsize=(6,4))
        plt.bar(features, [0]*len(features), color='lightgray')
        plt.xticks(rotation=45)
        plt.title("Feature Importance")
        images["feature_importances"] = fig_to_base64()
        plt.close()
        
        return {"roc_auc": None, "error": "Solo una clase"}, images
    
    # ================================================
    # ENTRENAR ÁRBOL DE DECISIÓN ESPECÍFICO
    # ================================================
    
    # Configurar el árbol de decisión
    # max_depth=5 para que sea interpretable pero no demasiado simple
    arbol_model = DecisionTreeClassifier(
        max_depth=5,           # Controla complejidad
        min_samples_split=10,  # Mínimo muestras para dividir
        min_samples_leaf=5,    # Mínimo muestras en hoja
        random_state=42        # Reproducibilidad
    )
    
    # Entrenar el árbol (según instrucciones, con todos los datos)
    arbol_model.fit(X, y)
    
    # ================================================
    # 1. CURVA ROC CON EL ÁRBOL
    # ================================================
    
    # Obtener probabilidades para ROC (árbol da probabilidades de clase)
    y_probs = arbol_model.predict_proba(X)[:, 1]
    
    # Calcular curva ROC
    fpr, tpr, thresholds = roc_curve(y, y_probs)
    roc_auc = auc(fpr, tpr)
    
    # Gráfico de la curva ROC
    plt.figure(figsize=(8, 6))
    
    # Curva ROC del árbol
    plt.plot(fpr, tpr, color='green', lw=2.5,
             label=f'Árbol de Decisión (AUC = {roc_auc:.3f})')
    
    # Línea de referencia (modelo aleatorio)
    plt.plot([0, 1], [0, 1], color='navy', lw=1.5, 
             linestyle='--', label='Modelo aleatorio (AUC = 0.5)')
    
    # Rellenar área bajo la curva
    plt.fill_between(fpr, tpr, alpha=0.2, color='green')
    
    # Configurar gráfico
    plt.xlim([-0.02, 1.02])
    plt.ylim([-0.02, 1.02])
    plt.xlabel('False Positive Rate', fontsize=12)
    plt.ylabel('True Positive Rate', fontsize=12)
    plt.title('Curva ROC - Árbol de Decisión para Churn', fontsize=14)
    plt.legend(loc="lower right", fontsize=11)
    plt.grid(True, alpha=0.3)
    
    # Añadir información de métricas
    plt.figtext(0.15, 0.75, 
                f'AUC = {roc_auc:.3f}\n'
                f'Muestras = {len(X)}\n'
                f'Profundidad: {arbol_model.get_depth()}\n'
                f'Hojas: {arbol_model.get_n_leaves()}',
                fontsize=10,
                bbox=dict(boxstyle="round,pad=0.5", 
                         facecolor="lightgreen", 
                         alpha=0.8,
                         edgecolor='darkgreen'))
    
    images["roc_curve"] = fig_to_base64()
    plt.close()
    
    # ================================================
    # 2. FEATURE IMPORTANCE DEL ÁRBOL
    # ================================================
    
    # Obtener importancia de características del árbol
    importancias = arbol_model.feature_importances_
    
    # Crear DataFrame para ordenar
    importancia_df = pd.DataFrame({
        'Feature': features,
        'Importance': importancias
    }).sort_values('Importance', ascending=True)
    
    # Gráfico de barras horizontales
    plt.figure(figsize=(10, 6))
    
    # Colores según importancia
    colors = ['lightblue' if imp < 0.1 else 'steelblue' if imp < 0.3 else 'darkblue' 
              for imp in importancia_df['Importance']]
    
    bars = plt.barh(range(len(importancia_df)), 
                   importancia_df['Importance'],
                   color=colors,
                   alpha=0.8,
                   height=0.6)
    
    # Añadir valores numéricos
    for i, (bar, importancia) in enumerate(zip(bars, importancia_df['Importance'])):
        plt.text(importancia + 0.005, bar.get_y() + bar.get_height()/2,
                f'{importancia:.3f} ({importancia*100:.1f}%)',
                ha='left', va='center', fontsize=10)
    
    # Configurar gráfico
    plt.yticks(range(len(importancia_df)), importancia_df['Feature'], fontsize=11)
    plt.xlabel('Importancia Relativa', fontsize=12)
    plt.title('Importancia de Características - Árbol de Decisión', fontsize=14)
    
    # Línea de importancia promedio
    importancia_promedio = np.mean(importancias)
    plt.axvline(x=importancia_promedio, color='red', linestyle='--', 
                alpha=0.6, label=f'Promedio: {importancia_promedio:.3f}')
    plt.legend(loc='lower right')
    
    plt.grid(axis='x', alpha=0.3)
    plt.tight_layout()
    
    images["feature_importances"] = fig_to_base64()
    plt.close()
    
    # ================================================
    # 3. VISUALIZACIÓN DEL ÁRBOL (OPCIONAL PERO ÚTIL)
    # ================================================
    
    plt.figure(figsize=(16, 10))
    
    # Visualizar el árbol de decisión
    plot_tree(arbol_model,
              feature_names=features,
              class_names=['No Churn', 'Churn'],
              filled=True,
              rounded=True,
              fontsize=9,
              proportion=True,
              precision=2)
    
    plt.title('Árbol de Decisión Entrenado (max_depth=5)\nReglas para predecir abandono', 
              fontsize=14, pad=20)
    plt.tight_layout()
    
    images["decision_tree"] = fig_to_base64()
    plt.close()
    
    # ================================================
    # 4. REGLAS DEL ÁRBOL (TEXTO)
    # ================================================
    
    # Función para extraer reglas del árbol
    def get_tree_rules(tree, feature_names):
        from sklearn.tree import _tree
        
        tree_ = tree.tree_
        feature_name = [
            feature_names[i] if i != _tree.TREE_UNDEFINED else "undefined!"
            for i in tree_.feature
        ]
        
        rules = []
        
        def recurse(node, depth, rule):
            if tree_.feature[node] != _tree.TREE_UNDEFINED:
                name = feature_name[node]
                threshold = tree_.threshold[node]
                
                # Rama izquierda
                new_rule = f"{rule} AND {name} <= {threshold:.2f}" if rule else f"{name} <= {threshold:.2f}"
                recurse(tree_.children_left[node], depth + 1, new_rule)
                
                # Rama derecha
                new_rule = f"{rule} AND {name} > {threshold:.2f}" if rule else f"{name} > {threshold:.2f}"
                recurse(tree_.children_right[node], depth + 1, new_rule)
            else:
                # Hoja
                class_prob = tree_.value[node][0]
                total_samples = class_prob.sum()
                churn_prob = class_prob[1] / total_samples if total_samples > 0 else 0
                
                rule_clean = rule.replace("AND ", "").strip()
                rules.append({
                    'rule': rule_clean,
                    'samples': int(total_samples),
                    'churn_probability': float(churn_prob),
                    'prediction': 1 if churn_prob > 0.5 else 0
                })
        
        recurse(0, 1, "")
        return rules
    
    # Extraer reglas
    tree_rules = get_tree_rules(arbol_model, features)
    
    # ================================================
    # 5. RETORNAR RESULTADOS
    # ================================================
    
    metrics = {
        "roc_auc": float(roc_auc),
        "tree_depth": int(arbol_model.get_depth()),
        "tree_leaves": int(arbol_model.get_n_leaves()),
        "best_feature": importancia_df.iloc[-1]['Feature'],
        "best_feature_importance": float(importancia_df.iloc[-1]['Importance']),
        "n_samples": len(X),
        "class_distribution": {int(k): int(v) for k, v in zip(*np.unique(y, return_counts=True))},
        "tree_rules_count": len(tree_rules)
    }
    
    # Mostrar información por consola
    print(f"\n🌳 ÁRBOL DE DECISIÓN - RESULTADOS:")
    print(f"   AUC-ROC: {roc_auc:.4f}")
    print(f"   Profundidad del árbol: {arbol_model.get_depth()}")
    print(f"   Número de hojas: {arbol_model.get_n_leaves()}")
    print(f"   Característica más importante: {metrics['best_feature']} ({metrics['best_feature_importance']*100:.1f}%)")
    print(f"   Reglas extraídas: {len(tree_rules)}")
    
    # Mostrar algunas reglas importantes
    if tree_rules:
        print(f"\n📋 REGLAS IMPORTANTES DEL ÁRBOL:")
        for i, rule in enumerate(sorted(tree_rules, key=lambda x: x['samples'], reverse=True)[:3]):
            print(f"   {i+1}. Si {rule['rule']}")
            print(f"      → Probabilidad de churn: {rule['churn_probability']:.1%}")
            print(f"      → Muestras: {rule['samples']}")
    
    return metrics, images


# ======================================================================
# 4) RUN PIPELINE
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


# ======================================================================
# EJEMPLO DE USO
# ======================================================================
if __name__ == "__main__":
    # Datos de ejemplo para probar
    datos_ejemplo = [
        {
            "user_id": "user1",
            "session_length": 300,
            "points_scored": 50,
            "errors": 5,
            "n_attempts": 3,
            "help_clicks": 2,
            "churn_rate": 0
        },
        {
            "user_id": "user2", 
            "session_length": 150,
            "points_scored": 20,
            "errors": 10,
            "n_attempts": 5,
            "help_clicks": 6,
            "churn_rate": 1
        }
    ] * 50  # Multiplicamos para tener más datos
    
    # Añadir más variabilidad
    import random
    for i in range(len(datos_ejemplo)):
        datos_ejemplo[i]["level_reached"] = random.randint(1, 20)
        if i % 3 == 0:
            datos_ejemplo[i]["churn_rate"] = 1
    
    # Ejecutar pipeline
    resultados = run_pipeline(datos_ejemplo)
    
    print("\n" + "="*50)
    print("✅ PIPELINE COMPLETADO")
    print("="*50)
    print(f"📊 Métricas básicas:")
    print(f"   Jugadores: {resultados['metrics']['player_count']}")
    print(f"   Tasa de retención: {resultados['metrics']['retention_rate']:.1%}")
    print(f"   Tasa de churn: {resultados['metrics']['churn_rate']:.1%}")
    
    if resultados['model_metrics'].get('roc_auc'):
        print(f"\n🤖 Métricas del modelo (Árbol de Decisión):")
        print(f"   AUC-ROC: {resultados['model_metrics']['roc_auc']:.4f}")
        print(f"   Característica más importante: {resultados['model_metrics']['best_feature']}")
        print(f"   Importancia: {resultados['model_metrics']['best_feature_importance']*100:.1f}%")
    
    print(f"\n🖼️ Gráficos generados:")
    for key in resultados['images'].keys():
        print(f"   - {key}")