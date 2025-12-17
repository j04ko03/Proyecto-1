/**
 * Módulo de Físicas y Jugador para Bosque.js
 * Gestiona el movimiento, colisiones y renderizado DOM del personaje.
 * @namespace BosqueFisicas
 */

(function () {
    console.log("Cargando físicas de Bosque...");

    const GRAVITY = 0.6;
    const FRICTION = 0.85;
    const PLAYER_SPEED = 2;
    const JUMP_POWER = -10;
    const GROUND_Y = 260;

    let keys = {};
    let isModalOpen = false;

    // Estado animación
    let playerDirection = 'derecha';
    let playerState = 'idle';

    const Fisicas = {
        CONSTANTS: {
            CANVAS_W: 900,
            CANVAS_H: 380,
            GROUND_Y: GROUND_Y
        },

        player: {
            x: 50,
            y: GROUND_Y,
            width: 40,
            height: 60,
            vx: 0,
            vy: 0,
            onGround: false,
            element: null // New: DOM Reference
        },

        setModalOpen: function (isOpen) {
            isModalOpen = isOpen;
        },

        resetPlayer: function () {
            this.player.x = 50;
            this.player.y = GROUND_Y;
            this.player.vx = 0;
            this.player.vy = 0;
            this.player.onGround = false;
            // No updateramos DOM aquí, se hará en el loop
        },

        resetControls: function () {
            keys = {};
        },

        setupControls: function () {
            window.addEventListener('keydown', (e) => {
                keys[e.code] = true;
                if (!isModalOpen) {
                    if ((e.code === 'Space' || e.code === 'ArrowUp') && this.player.onGround) {
                        this.player.vy = JUMP_POWER;
                        this.player.onGround = false;
                    }
                }
            });

            window.addEventListener('keyup', (e) => {
                keys[e.code] = false;
            });
        },

        /**
         * Inicializa el elemento DOM del jugador.
         * @param {HTMLElement} container 
         */
        initPlayerDOM: function (container) {
            if (this.player.element) {
                this.player.element.remove();
            }

            const el = document.createElement('img');
            el.id = 'player-sprite';
            el.style.position = 'absolute';
            el.style.width = this.player.width + 'px';
            el.style.height = this.player.height + 'px';
            el.style.zIndex = '100'; // Encima de obstáculos

            // Imagen default
            const images = window.BosqueRecursos ? window.BosqueRecursos.images : null;
            if (images && images.personajeIdleDerecha) {
                el.src = images.personajeIdleDerecha.src;
            }

            container.appendChild(el);
            this.player.element = el;

            // Posicion inicial
            this.updatePlayerDOM();
        },

        /**
         * Actualiza física y sincroniza DOM.
         */
        updatePlayer: function (containerWidth, containerHeight, onFall) {
            if (isModalOpen) return;

            // Física
            if (keys['ArrowLeft'] || keys['KeyA']) {
                this.player.vx = -PLAYER_SPEED;
            } else if (keys['ArrowRight'] || keys['KeyD']) {
                this.player.vx = PLAYER_SPEED;
            } else {
                this.player.vx *= FRICTION;
            }

            this.player.vy += GRAVITY;

            let nextX = this.player.x + this.player.vx;
            let nextY = this.player.y + this.player.vy;

            if (nextY >= GROUND_Y) {
                nextY = GROUND_Y;
                this.player.vy = 0;
                this.player.onGround = true;
            } else {
                this.player.onGround = false;
            }

            if (nextX < 0) nextX = 0;
            if (nextX + this.player.width > containerWidth) nextX = containerWidth - this.player.width;

            this.player.x = nextX;
            this.player.y = nextY;

            if (this.player.y > containerHeight + 50) {
                if (onFall) onFall();
                this.resetPlayer();
            }

            // Sincronizar DOM
            this.updatePlayerDOM();
        },

        updatePlayerDOM: function () {
            if (!this.player.element) return;

            const p = this.player;
            p.element.style.left = p.x + 'px';
            p.element.style.top = p.y + 'px';

            // Animación / Sprite
            const images = window.BosqueRecursos ? window.BosqueRecursos.images : null;
            if (!images || !images.loaded) return;

            if (p.vx > 0) playerDirection = 'derecha';
            if (p.vx < 0) playerDirection = 'izquierda';

            if (!p.onGround) {
                playerState = 'saltar';
            } else if (Math.abs(p.vx) > 0.1) {
                playerState = 'caminar';
            } else {
                playerState = 'idle';
            }

            let imgNode = null;
            if (playerState === 'saltar') {
                imgNode = playerDirection === 'derecha' ? images.personajeSaltoDerecha : images.personajeSaltoIzquierda;
            } else if (playerState === 'caminar') {
                imgNode = playerDirection === 'derecha' ? images.personajeCaminarDerecha : images.personajeCaminarIzquierda;
            } else {
                imgNode = playerDirection === 'derecha' ? images.personajeIdleDerecha : images.personajeIdleIzquierda;
            }

            if (imgNode && p.element.src !== imgNode.src) {
                p.element.src = imgNode.src;
            }
        }
    };

    window.BosqueFisicas = Fisicas;

})();
