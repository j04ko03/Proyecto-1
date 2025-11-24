/**
 * INICIALIZADOR DEL JUEGO DEL BOSQUE
 * Compatible con el sistema CartuchoManager
 */

function inicializadorBosque() {
    console.log("🌲 Inicializador del Bosque ejecutándose...");
    
    // Verificar que el canvas existe
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error("❌ No se encontró el canvas");
        return;
    }
    
    // Verificar que la función principal existe
    if (typeof window.iniciarBosque !== 'function') {
        console.error("❌ La función iniciarBosque no está definida");
        return;
    }
    
    console.log("✅ Iniciando juego del bosque...");
    
    // Ejecutar el juego
    try {
        window.iniciarBosque();
        console.log("✅ Juego iniciado correctamente");
    } catch (error) {
        console.error("❌ Error al iniciar:", error);
    }
}

// Exponer globalmente
window.inicializadorBosque = inicializadorBosque;