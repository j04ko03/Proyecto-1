/**
 * AVENTURA DE PROGRAMACIÓN EN EL BOSQUE
 * Juego educativo para aprender conceptos básicos de programación
 */

window.iniciarBosque = function () {
    console.log("🌲 Juego del Bosque iniciado");

    /* ============================================
       CANVAS Y CONTEXTO
    ============================================ */
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error("❌ No se encontró el canvas");
        return;
    }
    
    const ctx = canvas.getContext('2d');

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
        console.log("Redimensionando canvas:", width, height);
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    });

    /* ============================================
       CONSTANTES DE FÍSICA
    ============================================ */
    const GRAVITY = 0.6;
    const FRICTION = 0.85;
    const PLAYER_SPEED = 3;
    const JUMP_POWER = -12;
    const GROUND_Y = 280;

    /* ============================================
       ESTADO DEL JUEGO
    ============================================ */
    const game = {
        currentLevel: 1,
        score: 0,
        isChallenge: false,
        currentObstacle: null,
        gameActive: false,
        imagesLoaded: false
    };

    /* ============================================
       IMÁGENES
    ============================================ */
    const images = {
        astronaut: null
    };

    // Cargar imágenes
    function loadImages() {
        return new Promise((resolve, reject) => {
            images.astronaut = new Image();
            images.astronaut.onload = () => {
                console.log("✅ Astronauta cargado");
                game.imagesLoaded = true;
                resolve();
            };
            images.astronaut.onerror = () => {
                console.warn("⚠️ No se pudo cargar el astronauta, usando fallback");
                game.imagesLoaded = false;
                resolve(); // Continuar sin la imagen
            };
            images.astronaut.src = '/img/juegos/bosque/astronauta.png';
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
                        title: "🌉 Repara el Puente",
                        text: "Para cruzar el puente, completa esta secuencia:\nAVANZAR → SALTAR → ___",
                        answer: "AVANZAR",
                        hint: "Después de saltar, ¿qué haces para continuar?"
                    }
                },
                {
                    x: 600,
                    type: 'arbol',
                    solved: false,
                    challenge: {
                        title: "🌳 Árbol Bloqueando",
                        text: "¿Cuántos pasos necesitas para rodear el árbol si cada paso es 1 metro y el árbol mide 3 metros?",
                        answer: "3",
                        hint: "El árbol mide 3 metros"
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
                        title: "🪨 Rocas en el Camino",
                        text: "Hay 5 rocas. Si repites 'MOVER_ROCA' 5 veces, ¿cuántas rocas quedarán?",
                        answer: "0",
                        hint: "¿Qué pasa cuando mueves todas las rocas?"
                    }
                },
                {
                    x: 550,
                    type: 'flores',
                    solved: false,
                    challenge: {
                        title: "🌸 Recolecta Flores",
                        text: "Completa el código:\nREPETIR ___ VECES { RECOGER_FLOR }\npara recoger 4 flores",
                        answer: "4",
                        hint: "¿Cuántas veces debes repetir la acción?"
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
                        title: "🌊 Cruzar el Río",
                        text: "SI hay_puente ENTONCES cruzar, SI_NO nadar.\n¿Hay puente? (responde: SI o NO)",
                        answer: "SI",
                        hint: "Observa la imagen, ¿ves un puente?"
                    }
                },
                {
                    x: 650,
                    type: 'cueva',
                    solved: false,
                    challenge: {
                        title: "🏔️ Entrada a la Cueva",
                        text: "SI tienes_linterna ENTONCES entrar.\nCompleta: SI tienes_linterna ___ entrar",
                        answer: "ENTONCES",
                        hint: "Es la palabra que conecta la condición con la acción"
                    }
                }
            ]
        },
        {
            name: "Bucles y Condicionales",
            obstacles: [
                {
                    x: 300,
                    type: 'hongos',
                    solved: false,
                    challenge: {
                        title: "🍄 Hongos Mágicos",
                        text: "PARA cada hongo: SI es_rojo ENTONCES recoger.\nHay 3 hongos rojos y 2 azules. ¿Cuántos recoges?",
                        answer: "3",
                        hint: "Solo recoges los hongos rojos"
                    }
                },
                {
                    x: 600,
                    type: 'animales',
                    solved: false,
                    challenge: {
                        title: "🦊 Animales del Bosque",
                        text: "MIENTRAS hay_animales: SI animal_dormido ENTONCES pasar_silencioso.\n¿Qué palabra indica repetición?",
                        answer: "MIENTRAS",
                        hint: "Es la primera palabra del código"
                    }
                }
            ]
        },
        {
            name: "Desafío Final",
            obstacles: [
                {
                    x: 400,
                    type: 'tesoro',
                    solved: false,
                    challenge: {
                        title: "💎 El Tesoro del Bosque",
                        text: "REPETIR 3 { SI puerta_cerrada ENTONCES usar_llave }.\n¿Cuántas veces usas la llave si todas están cerradas?",
                        answer: "3",
                        hint: "Todas las puertas están cerradas y repites 3 veces"
                    }
                }
            ]
        }
    ];

    /* ============================================
       CONTROLES
    ============================================ */
    const keys = {};

    function setupControls() {
        window.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            
            if (!game.isChallenge) {
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
        // Movimiento horizontal
        if (keys['ArrowLeft'] || keys['KeyA']) {
            player.vx = -PLAYER_SPEED;
        } else if (keys['ArrowRight'] || keys['KeyD']) {
            player.vx = PLAYER_SPEED;
        } else {
            player.vx *= FRICTION;
        }

        // Gravedad
        player.vy += GRAVITY;

        // Nueva posición
        let nextX = player.x + player.vx;
        let nextY = player.y + player.vy;

        // Colisión con suelo
        if (nextY >= GROUND_Y) {
            nextY = GROUND_Y;
            player.vy = 0;
            player.onGround = true;
        } else {
            player.onGround = false;
        }

        // Límites
        if (nextX < 0) nextX = 0;
        if (nextX + player.width > CANVAS_W) nextX = CANVAS_W - player.width;

        player.x = nextX;
        player.y = nextY;

        // Reset si cae fuera
        if (player.y > CANVAS_H + 50) {
            resetPlayer();
        }
    }

    /* ============================================
       DIBUJAR ESCENARIO
    ============================================ */
    function drawScene() {
        // Cielo degradado
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.6, '#98D8C8');
        gradient.addColorStop(1, '#90EE90');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Suelo
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, GROUND_Y + player.height, CANVAS_W, CANVAS_H);

        // Césped
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, GROUND_Y + player.height - 5, CANVAS_W, 5);

        // Árboles decorativos
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
    function drawPlayer() {
        if (images.astronaut && game.imagesLoaded) {
            ctx.drawImage(
                images.astronaut,
                player.x,
                player.y,
                player.width,
                player.height
            );
        } else {
            // Fallback
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
    function drawObstacles() {
        const currentObstacles = levels[game.currentLevel - 1].obstacles;
        
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        currentObstacles.forEach(obstacle => {
            if (!obstacle.solved) {
                const obstY = GROUND_Y;
                
                switch (obstacle.type) {
                    case 'puente':
                        ctx.fillStyle = '#8B4513';
                        ctx.fillRect(obstacle.x, obstY + 40, 80, 10);
                        ctx.fillText('🌉', obstacle.x + 40, obstY + 20);
                        break;
                        
                    case 'arbol':
                        ctx.fillStyle = '#654321';
                        ctx.fillRect(obstacle.x + 20, obstY, 20, 60);
                        ctx.fillText('🌳', obstacle.x + 30, obstY - 10);
                        break;
                        
                    case 'rocas':
                        ctx.fillStyle = '#808080';
                        for (let i = 0; i < 3; i++) {
                            ctx.beginPath();
                            ctx.arc(obstacle.x + i * 20, obstY + 40, 12, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.fillText('🪨', obstacle.x + 20, obstY + 15);
                        break;
                        
                    case 'rio':
                        ctx.fillStyle = '#4169E1';
                        ctx.fillRect(obstacle.x, obstY + 20, 80, 40);
                        ctx.fillText('🌊', obstacle.x + 40, obstY + 40);
                        break;
                        
                    case 'flores':
                        ctx.fillText('🌸', obstacle.x + 30, obstY + 30);
                        break;
                        
                    case 'cueva':
                        ctx.fillText('🏔️', obstacle.x + 30, obstY + 30);
                        break;
                        
                    case 'hongos':
                        ctx.fillText('🍄', obstacle.x + 30, obstY + 30);
                        break;
                        
                    case 'animales':
                        ctx.fillText('🦊', obstacle.x + 30, obstY + 30);
                        break;
                        
                    case 'tesoro':
                        ctx.fillText('💎', obstacle.x + 30, obstY + 30);
                        break;
                        
                    default:
                        ctx.fillStyle = '#e74c3c';
                        ctx.fillRect(obstacle.x, obstY, 60, 60);
                        ctx.fillStyle = 'white';
                        ctx.font = 'bold 40px Arial';
                        ctx.fillText('?', obstacle.x + 30, obstY + 30);
                        break;
                }
            }
        });
    }

    /* ============================================
       COLISIONES
    ============================================ */
    function checkObstacleCollision() {
        const currentObstacles = levels[game.currentLevel - 1].obstacles;
        
        currentObstacles.forEach(obstacle => {
            if (!obstacle.solved) {
                const collision = 
                    player.x + player.width > obstacle.x &&
                    player.x < obstacle.x + 60 &&
                    Math.abs(player.y - GROUND_Y) < 10;
                
                if (collision && !game.isChallenge) {
                    game.isChallenge = true;
                    game.currentObstacle = obstacle;
                    showChallenge(obstacle.challenge);
                }
            }
        });
    }

    /* ============================================
       SISTEMA DE DESAFÍOS (usando prompts simples)
    ============================================ */
    function showChallenge(challenge) {
        // Pausar el juego
        const oldGameActive = game.gameActive;
        game.gameActive = false;
        
        setTimeout(() => {
            const respuesta = prompt(
                `${challenge.title}\n\n${challenge.text}\n\n${challenge.hint}`
            );
            
            if (respuesta) {
                checkAnswer(respuesta.trim().toUpperCase());
            } else {
                game.isChallenge = false;
                game.gameActive = oldGameActive;
            }
        }, 100);
    }

    function checkAnswer(userAnswer) {
        const correctAnswer = game.currentObstacle.challenge.answer.toUpperCase();
        
        if (userAnswer === correctAnswer) {
            alert('¡Correcto! 🎉');
            game.score++;
            game.currentObstacle.solved = true;
            game.isChallenge = false;
            game.gameActive = true;
            
            updateInfo();
            checkLevelComplete();
        } else {
            alert('❌ Incorrecto. ¡Inténtalo de nuevo!');
            game.isChallenge = false;
            game.gameActive = true;
        }
    }

    /* ============================================
       NIVEL COMPLETADO
    ============================================ */
    function checkLevelComplete() {
        const currentObstacles = levels[game.currentLevel - 1].obstacles;
        const allSolved = currentObstacles.every(obs => obs.solved);
        
        if (allSolved) {
            setTimeout(() => {
                game.gameActive = false;
                
                if (game.currentLevel < levels.length) {
                    if (confirm(`¡Nivel ${game.currentLevel} completado! 🎉\n¿Pasar al siguiente nivel?`)) {
                        game.currentLevel++;
                        loadLevel(game.currentLevel);
                        game.gameActive = true;
                    }
                } else {
                    alert('¡Felicidades! Has completado todos los niveles 🏆');
                    game.currentLevel = 1;
                    game.score = 0;
                    loadLevel(1);
                    game.gameActive = true;
                }
            }, 500);
        }
    }

    /* ============================================
       CARGAR NIVEL
    ============================================ */
    function loadLevel(levelNum) {
        game.currentLevel = levelNum;
        resetPlayer();
        
        levels[levelNum - 1].obstacles.forEach(obs => {
            obs.solved = false;
        });
        
        updateInfo();
    }

    /* ============================================
       ACTUALIZAR INFO EN PANTALLA
    ============================================ */
    function updateInfo() {
        // Mostrar info en el canvas
        drawInfo();
    }

    function drawInfo() {
        // Info en la esquina superior izquierda
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 250, 60);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Nivel ${game.currentLevel}: ${levels[game.currentLevel - 1].name}`, 20, 30);
        ctx.fillText(`Desafíos resueltos: ${game.score}`, 20, 55);
    }

    /* ============================================
       LOOP PRINCIPAL
    ============================================ */
    function gameLoop() {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        
        drawScene();
        drawObstacles();
        drawPlayer();
        drawInfo();
        
        if (game.gameActive && !game.isChallenge) {
            updatePlayer();
            checkObstacleCollision();
        }
        
        requestAnimationFrame(gameLoop);
    }

    /* ============================================
       INICIALIZACIÓN
    ============================================ */
    async function init() {
        console.log("🎮 Inicializando juego del bosque...");
        
        try {
            await loadImages();
            setupControls();
            loadLevel(1);
            
            // Mensaje inicial
            setTimeout(() => {
                if (confirm('🌲 AVENTURA DE PROGRAMACIÓN EN EL BOSQUE 🌲\n\n' +
                           'Usa las flechas ← → para moverte\n' +
                           'Espacio para saltar\n\n' +
                           'Resuelve los desafíos para avanzar\n\n' +
                           '¿Comenzar?')) {
                    game.gameActive = true;
                }
            }, 500);
            
            gameLoop();
            
        } catch (error) {
            console.error("❌ Error inicializando:", error);
        }
    }

    init();
};

window.bosqueJugable = iniciarBosque;