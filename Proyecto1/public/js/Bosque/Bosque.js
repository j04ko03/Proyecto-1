/**
 * AVENTURA DE PROGRAMACIÓN EN EL BOSQUE
 * Lógica principal del juego (Versión DOM).
 * Integra Recursos.js y Fisicas.js.
 */

window.iniciarBosque = function () {
    console.log("Iniciando Bosque");

    // helper para cargar scrips
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            // Verificar si ya está cargado por nombre de archivo
            if (document.querySelector(`script[src*="${src}"]`)) {
                // Pequeño timeout por si está en proceso de carga
                setTimeout(resolve, 100);
                return;
            }
            const script = document.createElement('script');
            script.src = (window.assetBaseUrl || '') + 'js/Bosque/' + src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Error cargando ${src}`));
            document.body.appendChild(script);
        });
    }

    // CONTENEDOR DOM
    const gameContainer = document.querySelector('#game-container');
    if (!gameContainer) {
        console.error("Contenedor de juego '#game-container' no encontrado.");
        return;
    }

    // Configuración CSRF
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '{{ csrf_token() }}';

    // ESTADO DEL JUEGO
    let loopId;
    let gameActive = false;
    let modalOpen = false;

    // Estadísticas
    let puntos = 0;
    let vidas = 3;
    let nivel = 1;
    let erroresEnNivel = 0;
    let numeroIntentos = 0;
    let ayudas = 0;
    let datosSesionIdX = 0;

    // Estado del nivel actual
    let levels = []; // Se cargará desde JSON
    let plataformaActual = null;
    let obstacleElements = []; // Referencias DOM de obstáculos

    // UI ELEMENTOS
    const UI = {
        msg: document.getElementById('mensaje'),
        startBtn: document.getElementById('start-btn'),
        nivelEl: document.getElementById('nivel'),
        scoreEl: document.getElementById('score'),
        nombreNivelEl: document.getElementById('nivel-nombre'),
        modalChallenge: document.getElementById('modal-challenge'),
        challengeTitle: document.getElementById('challenge-title'),
        challengeText: document.getElementById('challenge-text'),
        challengeInput: document.getElementById('challenge-input'),
        challengeCancel: document.getElementById('challenge-cancel'),
        challengeSubmit: document.getElementById('challenge-submit'),

        cor1: document.getElementById('cor1'),
        cor2: document.getElementById('cor2'),
        cor3: document.getElementById('cor3')
    };

    /* ============================================
       CARGA DE DATOS (NIVELES)
    ============================================ */
    function loadLevelData() {
        return fetch((window.assetBaseUrl || '') + 'js/Bosque/niveles.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }
                return response.json();
            })
            .then(data => {
                levels = data;
                console.log("✅ Niveles cargados:", levels.length);
            })
            .catch(err => {
                console.error("❌ Error cargando niveles.json:", err);
                mostrarMensaje("Error", "No se pudieron cargar los niveles.");
            });
    }

    /* ============================================
       FUNCIONES DE JUEGO (Definiciones)
    ============================================ */

    function iniciarJuego() {
        const Fisicas = window.BosqueFisicas;
        const Recursos = window.BosqueRecursos;

        console.log("🎮 Inicializando juego...");
        Fisicas.setupControls();
        loadLevel(1);

        mostrarMensaje("🌲 Aventura del Bosque 🌲", "Usa ← → para moverte\nEspacio para saltar\n\n¿Comenzar?");

        if (UI.startBtn) {
            UI.startBtn.onclick = () => {
                iniciarBosqueConBD();
            };
        }
    }

    function gameLoop() {
        const Fisicas = window.BosqueFisicas;

        if (gameActive && !modalOpen) {
            Fisicas.updatePlayer(
                900, // Ancho container fijo por ahora
                380, // Alto container fijo
                () => quitarVida() // Callback onFall
            );
            checkObstacleCollision();
        }

        loopId = requestAnimationFrame(gameLoop);
    }

    function initObstaclesDOM() {
        const Recursos = window.BosqueRecursos;
        const Fisicas = window.BosqueFisicas;

        if (!levels[nivel - 1]) return;

        // Limpiar anteriores
        obstacleElements.forEach(el => el.remove());
        obstacleElements = [];

        const currentObstacles = levels[nivel - 1].obstacles;
        const images = Recursos.images;

        currentObstacles.forEach((obstacle, index) => {
            if (!obstacle.solved) {
                const obstY = Fisicas.CONSTANTS.GROUND_Y;
                const obstX = obstacle.x;

                let width = 60, height = 60;
                let src = null;

                // Configurar tipo
                if (images.loaded && images[obstacle.type]) {
                    src = images[obstacle.type].src;
                    switch (obstacle.type) {
                        case 'puente': width = 80; height = 40; break;
                        case 'arbol': width = 60; height = 80; break;
                        case 'roca': width = 50; height = 40; break;
                        case 'rio': width = 80; height = 50; break;
                        case 'flor': width = 30; height = 40; break;
                        case 'cueva': width = 90; height = 80; break;
                    }
                }

                // Crear elemento
                const el = document.createElement(src ? 'img' : 'div');
                el.style.position = 'absolute';
                el.style.left = obstX + 'px';
                el.style.top = (obstY - height + 60) + 'px';
                el.style.width = width + 'px';
                el.style.height = height + 'px';
                el.style.zIndex = '50';

                if (src) {
                    el.src = src;
                } else {
                    el.textContent = '🚧';
                    el.style.fontSize = '30px';
                    el.style.textAlign = 'center';
                }

                gameContainer.appendChild(el);
                obstacleElements.push({ data: obstacle, element: el });
            }
        });
    }

    function removeObstacleDOM(obstacleData) {
        const index = obstacleElements.findIndex(o => o.data === obstacleData);
        if (index !== -1) {
            obstacleElements[index].element.remove();
            obstacleElements.splice(index, 1);
        }
    }

    function checkObstacleCollision() {
        if (modalOpen) return;
        if (!levels[nivel - 1]) return;

        const Fisicas = window.BosqueFisicas;
        const p = Fisicas.player;

        levels[nivel - 1].obstacles.forEach(obstacle => {
            if (!obstacle.solved) {
                const collision =
                    p.x + p.width > obstacle.x &&
                    p.x < obstacle.x + 60 &&
                    Math.abs(p.y - Fisicas.CONSTANTS.GROUND_Y) < 10;

                if (collision) {
                    abriDesafio(obstacle);
                }
            }
        });
    }

    function abriDesafio(obstacle) {
        modalOpen = true;
        window.BosqueFisicas.setModalOpen(true);
        plataformaActual = obstacle;
        showChallenge(obstacle.challenge);
    }

    function quitarVida() {
        vidas--;
        erroresEnNivel++;
        puntos = Math.max(0, puntos - 50);
        actualizarUI();

        if (vidas <= 0) {
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
        erroresEnNivel = 0;
        if (levels[nivel - 1]) {
            levels[nivel - 1].obstacles.forEach(obs => obs.solved = false);
        }

        loadLevel(nivel);
        ocultarMensaje();
        iniciarBosqueConBD();
    }

    function loadLevel(levelNum) {
        const Fisicas = window.BosqueFisicas;
        if (!levels.length) return;

        nivel = levelNum;
        Fisicas.resetPlayer();
        Fisicas.resetControls(); // Detener movimiento automático

        if (levels[levelNum - 1]) {
            levels[levelNum - 1].obstacles.forEach(obs => obs.solved = false);
        }

        // Recrear DOM
        Fisicas.initPlayerDOM(gameContainer);
        initObstaclesDOM();

        actualizarUI();
        gameActive = true;
    }

    function checkLevelComplete() {
        if (!levels[nivel - 1]) return;
        const currentObstacles = levels[nivel - 1].obstacles;
        const allSolved = currentObstacles.every(obs => obs.solved);

        if (allSolved) {
            gameActive = false;
            guardarDatosNivel();

            if (nivel < levels.length) {
                setTimeout(() => {
                    if (confirm(`¡Nivel ${nivel} completado! 🎉\n¿Siguiente nivel?`)) {
                        loadLevel(nivel + 1);
                    }
                }, 500);
            } else {
                mostrarMensaje("¡Victoria!", "Has completado todos los niveles 🏆");
            }
        }
    }

    function actualizarUI() {
        const Recursos = window.BosqueRecursos;
        if (UI.nivelEl) UI.nivelEl.textContent = nivel;
        if (UI.scoreEl) UI.scoreEl.textContent = puntos;
        if (UI.nombreNivelEl && levels[nivel - 1]) UI.nombreNivelEl.textContent = levels[nivel - 1].name;

        // Corazones
        const imgFull = Recursos && Recursos.images.corazonLleno ? Recursos.images.corazonLleno.src : '/img/juegos/bosque/ui/corazon-lleno.png';
        const imgEmpty = Recursos && Recursos.images.corazonVacio ? Recursos.images.corazonVacio.src : '/img/juegos/bosque/ui/corazon-vacio.png';

        if (UI.cor1) UI.cor1.src = vidas >= 1 ? imgFull : imgEmpty;
        if (UI.cor2) UI.cor2.src = vidas >= 2 ? imgFull : imgEmpty;
        if (UI.cor3) UI.cor3.src = vidas >= 3 ? imgFull : imgEmpty;
    }

    function showChallenge(challenge) {
        if (UI.challengeTitle) UI.challengeTitle.textContent = challenge.title;
        if (UI.challengeText) UI.challengeText.textContent = `${challenge.text}\n\n💡 ${challenge.hint}`;
        if (UI.challengeInput) {
            UI.challengeInput.value = '';
            UI.challengeInput.focus();
        }
        if (UI.modalChallenge) UI.modalChallenge.style.display = 'block';
    }

    function hideChallenge() {
        if (UI.modalChallenge) UI.modalChallenge.style.display = 'none';
        if (UI.challengeInput) UI.challengeInput.value = ''; // Limpiar input
        modalOpen = false;
        window.BosqueFisicas.setModalOpen(false);
        gameActive = true;
    }

    // Event Listeners
    if (UI.challengeSubmit) {
        UI.challengeSubmit.onclick = () => {
            const userAnswer = UI.challengeInput.value.trim().toUpperCase();
            const correctAnswer = plataformaActual.challenge.answer.toUpperCase();

            if (userAnswer === correctAnswer) {
                puntos += 100;
                plataformaActual.solved = true;
                removeObstacleDOM(plataformaActual);
                actualizarUI();
                hideChallenge();
                checkLevelComplete();
            } else {
                erroresEnNivel++;
                puntos = Math.max(0, puntos - 25);
                actualizarUI();
                alert('❌ Incorrecto. ¡Inténtalo de nuevo!');
                UI.challengeInput.value = '';
                UI.challengeInput.focus();
            }
        };
    }

    if (UI.challengeCancel) {
        UI.challengeCancel.onclick = () => hideChallenge();
    }

    function mostrarMensaje(title, body) {
        if (UI.msg) {
            UI.msg.style.display = 'block';
            const titleEl = document.getElementById('msg-title');
            const bodyEl = document.getElementById('msg-body');
            if (titleEl) titleEl.textContent = title;
            if (bodyEl) bodyEl.textContent = body;
        }
    }

    function ocultarMensaje() {
        if (UI.msg) UI.msg.style.display = 'none';
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
        if (!csrfToken) return;

        fetch('/juegos/bosque/finalizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
            body: JSON.stringify({
                datosSesionId: datosSesionIdX,
                score: puntos,
                numeroIntentos: numeroIntentos,
                errores: erroresEnNivel,
                puntuacion: puntos,
                helpclicks: ayudas
            })
        }).then(res => res.json())
            .then(data => console.log("✅ Progreso guardado:", data))
            .catch(err => console.error("❌ Error guardando:", err));
    }

    function iniciarBosqueConBD() {
        ocultarMensaje();

        const dades = extreureCookie("user");
        if (!dades) {
            console.warn("⚠️ Modo Offline");
            gameActive = true;
            if (!loopId) gameLoop();
            return;
        }

        fetch('/juegos/bosque/iniciar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken },
            body: JSON.stringify({ usuarioId: dades.user, juegoId: parseInt(dades.game) })
        })
            .then(res => res.json())
            .then(data => {
                console.log("✅ Sesión DB:", data);
                datosSesionIdX = data.datosSesionId;
                if (data.nivel) nivel = data.nivel.id;

                // Cargar nivel y arrancar
                loadLevel(nivel);

                gameActive = true;
                if (!loopId) gameLoop();
            })
            .catch(err => {
                console.error("❌ Error conexión DB:", err);
                gameActive = true;
                if (!loopId) gameLoop();
            });
    }

    // ARRANQUE - Carga dependencias primero, luego recursos y datos
    const initDeps = [];
    if (!window.BosqueRecursos) initDeps.push(loadScript('Recursos.js'));
    if (!window.BosqueFisicas) initDeps.push(loadScript('Fisicas.js'));

    Promise.all(initDeps)
        .then(() => {
            console.log("Deps cargadas, cargando recursos y niveles...");
            const Recursos = window.BosqueRecursos;

            return Promise.all([
                Recursos ? Recursos.loadImages() : Promise.reject("Recursos no disponible"),
                loadLevelData()
            ]);
        })
        .then(() => {
            console.log("✅ Sistema listo. Esperando usuario...");
            if (!window.BosqueRecursos || !window.BosqueFisicas) {
                throw new Error("Módulos no inicializados tras carga");
            }
            iniciarJuego();
        })
        .catch(err => {
            console.error("❌ Error crítico iniciando:", err);
            mostrarMensaje("Error de Carga", "No se han podido cargar los archivos del juego.\n" + err.message);
        });
};

window.bosqueJugable = window.iniciarBosque;