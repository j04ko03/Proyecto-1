/**
 * AVENTURA DE PROGRAMACIÓN EN EL BOSQUE
 * Versión con espera inteligente del DOM
 */

window.iniciarBosque = function () {
    console.log("🌲 Iniciando proceso de carga del Bosque...");

    // 🔥 FUNCIÓN QUE ESPERA HASTA QUE EL CANVAS EXISTA
    function esperarCanvas(callback, intentos = 0) {
        const canvas = document.getElementById('canvas');
        const maxIntentos = 50; // 5 segundos máximo (50 * 100ms)
        
        if (canvas) {
            console.log("✅ Canvas encontrado, iniciando juego...");
            callback();
        } else if (intentos < maxIntentos) {
            console.log(`⏳ Esperando canvas... (intento ${intentos + 1})`);
            setTimeout(() => esperarCanvas(callback, intentos + 1), 100);
        } else {
            console.error("❌ Timeout: Canvas no apareció después de 5 segundos");
        }
    }

    // 🔥 LLAMAR A LA FUNCIÓN DE ESPERA
    esperarCanvas(iniciarJuego);
};

// 🔥 ESTA ES LA FUNCIÓN REAL DEL JUEGO
function iniciarJuego() {
    console.log("🎮 Juego del Bosque iniciado");

    /* ============================================
       CANVAS Y CONTEXTO
    ============================================ */
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    if (!canvas || !ctx) {
        console.error("❌ Error crítico: Canvas o contexto no disponible");
        return;
    }

    // 🔥 CSRF Token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

    /* ============================================
       CONFIGURACIÓN DEL CANVAS
    ============================================ */
    const CANVAS_W = 900;
    const CANVAS_H = 380;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    // Funciones de escalado
    function toScreenX(x) { return x * (canvas.width / CANVAS_W); }
    function toScreenY(y) { return y * (canvas.height / CANVAS_H); }
    function toScreenW(w) { return w * (canvas.width / CANVAS_W); }
    function toScreenH(h) { return h * (canvas.height / CANVAS_H); }

    // Event listener para redimensionamiento
    window.addEventListener('contenedorResize', (e) => {
        const { width, height } = e.detail;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    });

    /* ============================================
       CONSTANTES DE FÍSICA
    ============================================ */
    const GRAVITY = 0.6;
    const FRICTION = 0.85;
    const PLAYER_SPEED = 2;
    const JUMP_POWER = -10;
    const GROUND_Y = 260;

    /* ============================================
       ESTADO DEL JUEGO
    ============================================ */
    let loopId;
    let puntos = 0;
    let vidas = 3;
    let nivel = 1;
    let erroresEnNivel = 0;
    let numeroIntentos = 0;
    let ayudas = 0;
    
    let datosSesionIdX = 0;
    let isReturningPlayer = false;
    
    let keys = {};
    let modalOpen = false;
    let gameActive = false;
    let plataformaActual = null;

    /* ============================================
       UI REFERENCIAS
    ============================================ */
    const msg = document.getElementById('mensaje');
    const startBtn = document.getElementById('start-btn');
    const nivelEl = document.getElementById('nivel');
    const scoreEl = document.getElementById('score');
    const nombreNivelEl = document.getElementById('nivel-nombre');
    
    // Modal de desafíos
    const modalChallenge = document.getElementById('modal-challenge');
    const challengeTitle = document.getElementById('challenge-title');
    const challengeText = document.getElementById('challenge-text');
    const challengeInput = document.getElementById('challenge-input');
    const challengeCancel = document.getElementById('challenge-cancel');
    const challengeSubmit = document.getElementById('challenge-submit');

    /* ============================================
       IMÁGENES
    ============================================ */
const images = {
    // Personaje
    personajeIdleDerecha: null,
    personajeIdleIzquierda: null,
    personajeCaminarDerecha: null,
    personajeCaminarIzquierda: null,
    personajeSaltoDerecha: null,
    personajeSaltoIzquierda: null,
    
    // Obstáculos
    puente: null,
    arbol: null,
    roca: null,
    flor: null,
    rio: null,
    cueva: null,
    
    // UI
    corazonLleno: null,
    corazonVacio: null,
    
    // Control de carga
    loaded: false,
    totalImages: 0,
    loadedImages: 0
};

function loadImages() {
    return new Promise((resolve) => {
        const imagesToLoad = [
            // Personaje
            { key: 'personajeIdleDerecha', src: '/img/juegos/bosque/personaje/idle-derecha.png' },
            { key: 'personajeIdleIzquierda', src: '/img/juegos/bosque/personaje/idle-izquierda.png' },
            { key: 'personajeCaminarDerecha', src: '/img/juegos/bosque/personaje/caminar-derecha.png' },
            { key: 'personajeCaminarIzquierda', src: '/img/juegos/bosque/personaje/caminar-izquierda.png' },
            { key: 'personajeSaltoDerecha', src: '/img/juegos/bosque/personaje/salto-derecha.png' },
            { key: 'personajeSaltoIzquierda', src: '/img/juegos/bosque/personaje/salto-izquierda.png' },
            
            // Obstáculos
            { key: 'puente', src: '/img/juegos/bosque/obstaculos/puente.png' },
            { key: 'arbol', src: '/img/juegos/bosque/obstaculos/arbol.png' },
            { key: 'roca', src: '/img/juegos/bosque/obstaculos/roca.png' },
            { key: 'flor', src: '/img/juegos/bosque/obstaculos/flor.png' },
            { key: 'rio', src: '/img/juegos/bosque/obstaculos/rio.png' },
            { key: 'cueva', src: '/img/juegos/bosque/obstaculos/cueva.png' },
            
            // UI
            { key: 'corazonLleno', src: '/img/juegos/bosque/ui/corazon-lleno.png' },
            { key: 'corazonVacio', src: '/img/juegos/bosque/ui/corazon-vacio.png' }
        ];

        images.totalImages = imagesToLoad.length;
        images.loadedImages = 0;

        // Si no hay imágenes, resolver inmediatamente
        if (imagesToLoad.length === 0) {
            console.log("⚠️ No hay imágenes para cargar");
            images.loaded = false;
            resolve();
            return;
        }

        imagesToLoad.forEach(imgData => {
            const img = new Image();
            
            img.onload = () => {
                images.loadedImages++;
                console.log(`✅ Imagen cargada: ${imgData.key} (${images.loadedImages}/${images.totalImages})`);
                
                if (images.loadedImages === images.totalImages) {
                    images.loaded = true;
                    console.log("✅ Todas las imágenes cargadas");
                    resolve();
                }
            };
            
            img.onerror = () => {
                images.loadedImages++;
                console.warn(`⚠️ Error cargando: ${imgData.src}`);
                
                if (images.loadedImages === images.totalImages) {
                    images.loaded = true; // Continuar aunque falten imágenes
                    console.log("✅ Carga de imágenes completada (con errores)");
                    resolve();
                }
            };
            
            img.src = imgData.src;
            images[imgData.key] = img;
        });
    });
}

    /* ============================================
       JUGADOR
    ============================================ */
    const player = {
        x: 50,
        y: GROUND_Y,
        width: 40,
        height: 60,
        vx: 0,
        vy: 0,
        onGround: false
    };

    function resetPlayer() {
        player.x = 50;
        player.y = GROUND_Y;
        player.vx = 0;
        player.vy = 0;
        player.onGround = false;
    }

    /* ============================================
       NIVELES
    ============================================ */
    const levels = [
        {
            name: "Secuencias Básicas",
            obstacles: [
                {
                    x: 300,
                    type: 'puente',
                    solved: false,
                    challenge: {
                        title: "Repara el Puente",
                        text: "Completa la secuencia:\nAVANZAR → SALTAR → ___",
                        answer: "AVANZAR",
                        hint: "Pista: Después de saltar, continúas..."
                    }
                },
                {
                    x: 600,
                    type: 'arbol',
                    solved: false,
                    challenge: {
                        title: "Árbol Bloqueando",
                        text: "¿Cuántos pasos para rodear un árbol de 3 metros?",
                        answer: "3",
                        hint: "Pista: 1 paso = 1 metro"
                    }
                }
            ]
        },
        {
            name: "Repeticiones",
            obstacles: [
                {
                    x: 250,
                    type: 'rocas',
                    solved: false,
                    challenge: {
                        title: "Rocas en el Camino",
                        text: "Si repites 'MOVER_ROCA' 5 veces, ¿cuántas quedan?",
                        answer: "0",
                        hint: "Pista: Mueves todas"
                    }
                },
                {
                    x: 550,
                    type: 'flores',
                    solved: false,
                    challenge: {
                        title: "Recolecta Flores",
                        text: "REPETIR ___ VECES { RECOGER_FLOR } para 4 flores",
                        answer: "4",
                        hint: "Pista: ¿Cuántas veces?"
                    }
                }
            ]
        },
        {
            name: "Condicionales",
            obstacles: [
                {
                    x: 350,
                    type: 'rio',
                    solved: false,
                    challenge: {
                        title: "Cruzar el Río",
                        text: "SI hay_puente ENTONCES cruzar. ¿Hay puente? (SI/NO)",
                        answer: "SI",
                        hint: "Pista: Mira la imagen"
                    }
                },
                {
                    x: 650,
                    type: 'cueva',
                    solved: false,
                    challenge: {
                        title: "Entrada a la Cueva",
                        text: "SI tienes_linterna ___ entrar",
                        answer: "ENTONCES",
                        hint: "Pista: Conecta condición y acción"
                    }
                }
            ]
        }
    ];

    /* ============================================
       CONTROLES
    ============================================ */
    function setupControls() {
        window.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            
            if (!modalOpen && gameActive) {
                if ((e.code === 'Space' || e.code === 'ArrowUp') && player.onGround) {
                    player.vy = JUMP_POWER;
                    player.onGround = false;
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });
    }

    /* ============================================
       ACTUALIZACIÓN DEL JUGADOR
    ============================================ */
    function updatePlayer() {
        if (modalOpen) return;

        if (keys['ArrowLeft'] || keys['KeyA']) {
            player.vx = -PLAYER_SPEED;
        } else if (keys['ArrowRight'] || keys['KeyD']) {
            player.vx = PLAYER_SPEED;
        } else {
            player.vx *= FRICTION;
        }

        player.vy += GRAVITY;

        let nextX = player.x + player.vx;
        let nextY = player.y + player.vy;

        if (nextY >= GROUND_Y) {
            nextY = GROUND_Y;
            player.vy = 0;
            player.onGround = true;
        } else {
            player.onGround = false;
        }

        if (nextX < 0) nextX = 0;
        if (nextX + player.width > CANVAS_W) nextX = CANVAS_W - player.width;

        player.x = nextX;
        player.y = nextY;

        if (player.y > CANVAS_H + 50) {
            resetPlayer();
            quitarVida();
        }
    }

    /* ============================================
       VIDAS
    ============================================ */
    function quitarVida() {
        vidas--;
        erroresEnNivel++;
        puntos = Math.max(0, puntos - 50);
        actualizarUI();

        if (vidas === 0) {
            gameActive = false;
            numeroIntentos++;
            guardarDatosNivel();
            mostrarMensaje("Game Over", "Has perdido todas tus vidas. Intenta de nuevo.");
            setTimeout(() => {
                reiniciarNivel();
            }, 2000);
        }
    }

    function reiniciarNivel() {
        vidas = 3;
        puntos = 0;
        erroresEnNivel = 0;
        resetPlayer();
        levels[nivel - 1].obstacles.forEach(obs => obs.solved = false);
        gameActive = true;
        actualizarUI();
    }

    /* ============================================
       DIBUJAR ESCENARIO
    ============================================ */
    function drawScene() {
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#98D8C8');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, GROUND_Y + player.height, CANVAS_W, CANVAS_H);

        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, GROUND_Y + player.height - 5, CANVAS_W, 5);

        for (let i = 0; i < 6; i++) {
            drawBackgroundTree(100 + i * 150, 180);
        }
    }

    function drawBackgroundTree(x, y) {
        ctx.fillStyle = '#654321';
        ctx.fillRect(x, y, 15, 70);
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.arc(x + 7.5, y - 10, 25, 0, Math.PI * 2);
        ctx.fill();
    }

    /* ============================================
       DIBUJAR JUGADOR
    ============================================ */
/* ============================================
   DIBUJAR JUGADOR CON ANIMACIÓN
============================================ */
let playerDirection = 'derecha'; // 'derecha' o 'izquierda'
let playerState = 'idle'; // 'idle', 'caminar', 'saltar'
let animationFrame = 0;
let frameCounter = 0;

function drawPlayer() {
    // Determinar dirección
    if (player.vx > 0) playerDirection = 'derecha';
    if (player.vx < 0) playerDirection = 'izquierda';
    
    // Determinar estado
    if (!player.onGround) {
        playerState = 'saltar';
    } else if (Math.abs(player.vx) > 0.1) {
        playerState = 'caminar';
    } else {
        playerState = 'idle';
    }
    
    // Seleccionar imagen según estado y dirección
    let imgToUse = null;
    
    if (images.loaded) {
        if (playerState === 'saltar') {
            imgToUse = playerDirection === 'derecha' 
                ? images.personajeSaltoDerecha 
                : images.personajeSaltoIzquierda;
        } else if (playerState === 'caminar') {
            imgToUse = playerDirection === 'derecha' 
                ? images.personajeCaminarDerecha 
                : images.personajeCaminarIzquierda;
        } else {
            imgToUse = playerDirection === 'derecha' 
                ? images.personajeIdleDerecha 
                : images.personajeIdleIzquierda;
        }
    }
    
    // Dibujar
    if (imgToUse) {
        ctx.drawImage(imgToUse, player.x, player.y, player.width, player.height);
    } else {
        // Fallback si no hay imagen
        ctx.fillStyle = '#3498db';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(player.x + 20, player.y - 10, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

    /* ============================================
       DIBUJAR OBSTÁCULOS
    ============================================ */
/* ============================================
   DIBUJAR OBSTÁCULOS CON IMÁGENES
============================================ */
function drawObstacles() {
    const currentObstacles = levels[nivel - 1].obstacles;
    
    currentObstacles.forEach(obstacle => {
        if (!obstacle.solved) {
            const obstY = GROUND_Y;
            const obstX = obstacle.x;
            
            // Usar imágenes si están cargadas, sino emojis
            if (images.loaded) {
                let imgToUse = null;
                let width = 60;
                let height = 60;
                
                switch(obstacle.type) {
                    case 'puente':
                        imgToUse = images.puente;
                        width = 80;
                        height = 40;
                        break;
                    case 'arbol':
                        imgToUse = images.arbol;
                        width = 60;
                        height = 80;
                        break;
                    case 'rocas':
                        imgToUse = images.roca;
                        width = 50;
                        height = 40;
                        break;
                    case 'rio':
                        imgToUse = images.rio;
                        width = 80;
                        height = 50;
                        break;
                    case 'flores':
                        imgToUse = images.flor;
                        width = 30;
                        height = 40;
                        break;
                    case 'cueva':
                        imgToUse = images.cueva;
                        width = 90;
                        height = 80;
                        break;
                }
                
                if (imgToUse) {
                    ctx.drawImage(imgToUse, obstX, obstY - height + 30, width, height);
                } else {
                    // Fallback: emoji
                    dibujarObstaculoEmoji(obstacle.type, obstX, obstY);
                }
            } else {
                // Sin imágenes: usar emojis
                dibujarObstaculoEmoji(obstacle.type, obstX, obstY);
            }
        }
    });
}

function dibujarObstaculoEmoji(type, x, y) {
    const emojis = {
        'puente': '🌉',
        'arbol': '🌳',
        'rocas': '🪨',
        'rio': '🌊',
        'flores': '🌸',
        'cueva': '🏔️',
        'hongos': '🍄',
        'animales': '🦊',
        'tesoro': '💎'
    };
    
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emojis[type] || '❓', x + 30, y + 30);

    /* ============================================
       COLISIONES
    ============================================ */
    function checkObstacleCollision() {
        const currentObstacles = levels[nivel - 1].obstacles;
        
        currentObstacles.forEach(obstacle => {
            if (!obstacle.solved) {
                const collision = 
                    player.x + player.width > obstacle.x &&
                    player.x < obstacle.x + 60 &&
                    Math.abs(player.y - GROUND_Y) < 10;
                
                if (collision && !modalOpen) {
                    modalOpen = true;
                    plataformaActual = obstacle;
                    showChallenge(obstacle.challenge);
                }
            }
        });
    }

    /* ============================================
       SISTEMA DE DESAFÍOS
    ============================================ */
    function showChallenge(challenge) {
        gameActive = false;
        
        if (challengeTitle) challengeTitle.textContent = challenge.title;
        if (challengeText) challengeText.textContent = `${challenge.text}\n\n💡 ${challenge.hint}`;
        if (challengeInput) {
            challengeInput.value = '';
            challengeInput.focus();
        }
        if (modalChallenge) modalChallenge.style.display = 'block';
    }

    function hideChallenge() {
        if (modalChallenge) modalChallenge.style.display = 'none';
        modalOpen = false;
        gameActive = true;
    }

    if (challengeSubmit) {
        challengeSubmit.addEventListener('click', () => {
            const userAnswer = challengeInput.value.trim().toUpperCase();
            const correctAnswer = plataformaActual.challenge.answer.toUpperCase();
            
            if (userAnswer === correctAnswer) {
                puntos += 100;
                plataformaActual.solved = true;
                actualizarUI();
                hideChallenge();
                checkLevelComplete();
            } else {
                erroresEnNivel++;
                puntos = Math.max(0, puntos - 25);
                actualizarUI();
                alert('❌ Incorrecto. ¡Inténtalo de nuevo!');
                challengeInput.value = '';
                challengeInput.focus();
            }
        });
    }

    if (challengeCancel) {
        challengeCancel.addEventListener('click', () => {
            hideChallenge();
        });
    }

    /* ============================================
       ACTUALIZAR UI
    ============================================ */
function actualizarUI() {
    if (nivelEl) nivelEl.textContent = nivel;
    if (scoreEl) scoreEl.textContent = puntos;
    if (nombreNivelEl) nombreNivelEl.textContent = levels[nivel - 1].name;
    
    // 🔥 Actualizar corazones (si existen los elementos)
    const cor1 = document.getElementById('cor1');
    const cor2 = document.getElementById('cor2');
    const cor3 = document.getElementById('cor3');
    
    if (cor1 && cor2 && cor3 && images.loaded) {
        cor1.src = vidas >= 1 
            ? '/img/juegos/bosque/ui/corazon-lleno.png' 
            : '/img/juegos/bosque/ui/corazon-vacio.png';
        cor2.src = vidas >= 2 
            ? '/img/juegos/bosque/ui/corazon-lleno.png' 
            : '/img/juegos/bosque/ui/corazon-vacio.png';
        cor3.src = vidas >= 3 
            ? '/img/juegos/bosque/ui/corazon-lleno.png' 
            : '/img/juegos/bosque/ui/corazon-vacio.png';
    }
}

    /* ============================================
       NIVEL COMPLETADO
    ============================================ */
    function checkLevelComplete() {
        const currentObstacles = levels[nivel - 1].obstacles;
        const allSolved = currentObstacles.every(obs => obs.solved);
        
        if (allSolved) {
            gameActive = false;
            guardarDatosNivel();
            
            if (nivel < levels.length) {
                setTimeout(() => {
                    if (confirm(`¡Nivel ${nivel} completado! 🎉\n¿Siguiente nivel?`)) {
                        nivel++;
                        loadLevel(nivel);
                    }
                }, 500);
            } else {
                mostrarMensaje("¡Victoria!", "Has completado todos los niveles 🏆");
            }
        }
    }

    /* ============================================
       CARGAR NIVEL
    ============================================ */
    function loadLevel(levelNum) {
        nivel = levelNum;
        resetPlayer();
        levels[levelNum - 1].obstacles.forEach(obs => obs.solved = false);
        erroresEnNivel = 0;
        actualizarUI();
        gameActive = true;
    }

    /* ============================================
       LOOP PRINCIPAL
    ============================================ */
    function gameLoop() {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        
        drawScene();
        drawObstacles();
        drawPlayer();
        
        if (gameActive && !modalOpen) {
            updatePlayer();
            checkObstacleCollision();
        }
        
        loopId = requestAnimationFrame(gameLoop);
    }

    /* ============================================
       BASE DE DATOS
    ============================================ */
    function extreureCookie(clau) {
        const cookies = document.cookie.split('; ');
        for (let c of cookies) {
            const [key, value] = c.split('=');
            if (key === clau) return JSON.parse(value);
        }
        return null;
    }

    function guardarDatosNivel() {
        if (!csrfToken) {
            console.warn("⚠️ No hay CSRF token, no se puede guardar");
            return;
        }

        fetch('/juegos/bosque/finalizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                datosSesionId: datosSesionIdX,
                score: puntos,
                numeroIntentos: numeroIntentos,
                errores: erroresEnNivel,
                puntuacion: puntos,
                helpclicks: ayudas
            })
        })
        .then(res => res.json())
        .then(data => console.log("✅ Datos guardados:", data))
        .catch(err => console.error("❌ Error guardando:", err));
    }

    function iniciarBosqueConBD() {
        const dades = extreureCookie("user");
        if (!dades) {
            console.warn("⚠️ No hay cookie de usuario");
            gameActive = true;
            gameLoop();
            return;
        }

        const usuarioIdx = dades.user;
        const juegoIdx = parseInt(dades.game);

        fetch('/juegos/bosque/iniciar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                usuarioId: usuarioIdx,
                juegoId: juegoIdx
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log("✅ Sesión iniciada:", data);
            datosSesionIdX = data.datosSesionId;
            nivel = data.nivel ? data.nivel.id : 1;
            actualizarUI();
            gameActive = true;
            gameLoop();
        })
        .catch(err => {
            console.error("❌ Error iniciando:", err);
            gameActive = true;
            gameLoop();
        });
    }

    /* ============================================
       MENSAJES
    ============================================ */
    function mostrarMensaje(title, body) {
        if (msg) {
            msg.style.display = 'block';
            const titleEl = document.getElementById('msg-title');
            const bodyEl = document.getElementById('msg-body');
            if (titleEl) titleEl.textContent = title;
            if (bodyEl) bodyEl.textContent = body;
        }
    }

    function ocultarMensaje() {
        if (msg) msg.style.display = 'none';
    }

    /* ============================================
       INICIALIZACIÓN
    ============================================ */
    async function init() {
        console.log("🎮 Inicializando Bosque...");
        
        await loadImages();
        setupControls();
        loadLevel(1);
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                ocultarMensaje();
                iniciarBosqueConBD();
            });
        }
        
        setTimeout(() => {
            mostrarMensaje(
                "🌲 Aventura del Bosque 🌲",
                "Usa ← → para moverte\nEspacio para saltar\n\n¿Comenzar?"
            );
        }, 500);
    }

    init();
}

// 🔥 EXPORTAR (igual que tus compañeros)
window.bosqueJugable = window.iniciarBosque;
console.log("✅ Bosque.js cargado y listo");