window.iniciarAstro = function () {
    console.log("🚀 Astro Jugable iniciado");

    /*
      Misión Matemática — Nivel 1 (sencillo, pixel retro)
      Autor: Prototipo instantáneo
      Controles: Flechas izquierda/derecha, Espacio para saltar, E para interactuar con bloque
    */

    /* Canvas */
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    /* Contenedro que engloba canvas */
    //Se obtiene disparando el evento que tenemos en RedimensionCava.js 


    /* ------------- Configuraciones ------------- */
    const CANVAS_W = 900;
    const CANVAS_H = 380;

    

    function toScreenX(x){ return x * (canvas.width / CANVAS_W); }
    function toScreenY(y){ return y * (canvas.height / CANVAS_H); }
    function toScreenW(w){ return w * (canvas.width / CANVAS_W); }
    function toScreenH(h){ return h * (canvas.height / CANVAS_H); }

    window.addEventListener('contenedorResize', (e) => {
        const { width, height } = e.detail;
        console.log("Nuevo tamaño:", width, height);

        //canvas.width = width;
        //canvas.height = height;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        canvas.style = "border: 1px solid blue";

        // aquí puedes adaptar tu juego en caliente:
        // actualizar cámara, bounds, físicas, HUD, etc.
    });

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const GRAVITY = 0.6;
    const FRICTION = 0.85;
    const PLAYER_SPEED = 2.0;
    const JUMP_V = -10;
    const START_X = 40;
    const START_Y = 260;
    const LEVEL_ID = 1;


    /* Puntuación */
    let puntos = 0;

    let vidas = 3;
    let nivel = 1;
    let erroresEnNivel = 0;

    /* Estado del juego */
    let keys = {};
    let modalOpen = false;
    let gameActive = false;
    let levelComplete = false;

    /* UI referencias */
    const msg = document.getElementById('mensaje');
    const startBtn = document.getElementById('start-btn');
    const nivelEl = document.getElementById('nivel');
    const vidasEl = document.getElementById('vidas');
    const puntosEl = document.getElementById('puntos');
    const mejorEl = document.getElementById('mejor');
    mejorEl.textContent = mejor;


    /* Modal pregunta */
    const modal = document.getElementById('modal');
    const preguntaText = document.getElementById('pregunta-text');
    const respuestaInput = document.getElementById('respuesta-input');
    const cancelBtn = document.getElementById('cancel-btn');
    const submitBtn = document.getElementById('submit-btn');

    startBtn.addEventListener('click', () => {
        console.log("Iniciar juego pulsado, cerrando Mensaje....");
        ocultarMensaje();
        iniciarAstro();
    });

    /* ------------- Mundo / Plataformas ------------- */
    /* Un array de plataformas: {x,y,w,h, hasBlock, blockAsked, blockAnswered} */
    let plataformas = [];

    /* Bloques con preguntas (pos de plataforma index) */
    let piezaPregunta = [];

    /* Pieza final */
    const componenteNave1 = { 
        x: 840, 
        y: CANVAS_H - 80, 
        w: 36, 
        h: 36, 
        obtained: false 
    };

    
    function crearNivel1(){
        // plataformas flotantes (x, y, ancho, alto)
        const plataformasFlotantes = [
            [0, CANVAS_H - 20, 80, 16],//Parte inicial alta
            [80, CANVAS_H - 4, CANVAS_W - 10, 1],//Parte inicial baja
            [80, 290, 150, 16],
            [250, 230, 150, 16],
            [450, 190, 50, 16],
            [550, 160, 90, 16],
            [690, 120, 80, 16],// cerca del final
            [810, CANVAS_H - 20, 100, 16],
        ];

        //Limpiez del array principal de plataformas
        plataformas = [];


        plataformasFlotantes.forEach(plata => {
            plataformas.push({ 
                x: plata[0],
                y: plata[1], 
                w: plata[2], 
                h: plata[3],
                hasBlock: false,
                blockAsked: false,
                blockAnswered: false
            });
        });

        

        console.log("Plataformas nivel 1 creadas:", plataformas);
    }

    //Dibujar plataformas en nivel
    function dibujarPlataformas(){
        ctx.fillStyle = "#6b4f2a"; // color marrón para plataformas TODO->CAMBIAR POR IMAGEN
        plataformas.forEach(plata => {
            ctx.fillRect(
                toScreenX(plata.x),
                toScreenY(plata.y),
                toScreenW(plata.w),
                toScreenH(plata.h)
            );
        });
    };

    function rectanguloPieza(ctx, x, y, w, h, r, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }

    //Dibujar componente nave
    function dibujarComponenteNave(){
        if(!componenteNave1.obtained){
            console.log("Dibujando componente nave 1------------------------------------");
            ctx.fillStyle = '#F4A261';
            rectanguloPieza(ctx, componenteNave1.x, componenteNave1.y, componenteNave1.w, componenteNave1.h, 4, true, false);
            ctx.fillStyle = '#000';
            ctx.font = '10px monospace';
            const texto = "MOTOR";
            const textWidth = ctx.measureText(texto).width;

            const textX = componenteNave1.x + (componenteNave1.w - textWidth) / 2;
            const textY = componenteNave1.y + componenteNave1.h + 12;

            ctx.fillText(texto, textX, textY);
        }
    }


    /* Player */
    const playerPosInicio = {
        x: START_X - 40,
        y: START_Y + 65,
        w: 22, 
        h: 28,
        vx: 0, 
        vy: 0,
        onGround: false
    };

    function dibujarPlayer() {
        ctx.fillStyle = "#00f"; // azul
        ctx.fillRect(
            toScreenX(playerPosInicio.x),
            toScreenY(playerPosInicio.y),
            toScreenW(playerPosInicio.w),
            toScreenH(playerPosInicio.h)
        );
    }

    //Añado eventos de teclado para saber qué teclas están presionadas y que teclas se sueltan
    window.addEventListener('keydown', function (e) {
        keys[e.code] = true;
        console.log("Tecla presionada:", e.code);
    });
    window.addEventListener('keyup', function (e) {
        keys[e.code] = false;
        console.log("Tecla soltada:", e.code);
    });

    function reiniciarVidas(){
        vidas = 3;
        vidasEl.textContent = vidas;
    }
    
    function quitarUnaVida(){
        vidas -= 1;
        vidasEl.textContent = vidas;
        if(vidas <= 0){
            mostrarMensaje("Juego Terminado", "Has perdido todas tus vidas. Pulsa JUGAR para reiniciar.");
            reiniciarVidas();
            resetJugador();
        }
    }

    //Actualización de la posición del jugador
    function actualizarJugador() {
        if(keys['ArrowRight'] || keys['KeyD']) {
            console.log("Mover derecha");
            playerPosInicio.vx = PLAYER_SPEED;
        }else if(keys['ArrowLeft'] || keys['KeyA']) {
            console.log("Mover izquierda");
            playerPosInicio.vx = -PLAYER_SPEED;
        }else{
            playerPosInicio.vx *= FRICTION; // fricción para detenerse suavemente
        }

        // Salto -> controlar que el usuario solo pueda saltar si está en el suelo
        if((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && playerPosInicio.onGround) {
            console.log("Saltar");
            playerPosInicio.vy = JUMP_V;
            playerPosInicio.onGround = false;
        }

        // aplicar gravedad
        playerPosInicio.vy += GRAVITY;

        // --- CALCULAR POSICIÓN FUTURA ---
        let nextX = playerPosInicio.x + playerPosInicio.vx;
        let nextY = playerPosInicio.y + playerPosInicio.vy;

        // actualizar posición
        //playerPosInicio.x += playerPosInicio.vx;
        //playerPosInicio.y += playerPosInicio.vy;

        // colisiones con plataformas
        playerPosInicio.onGround = false;
        plataformas.forEach(plata => {
            //Verificar colision
            const colX =
                nextX < plata.x + plata.w &&
                nextX + playerPosInicio.w > plata.x;

            const estabaArriba =
                playerPosInicio.y + playerPosInicio.h <= plata.y;

            const caeEncima =
                nextY + playerPosInicio.h >= plata.y &&
                playerPosInicio.vy >= 0;

            // 🔧 CAMBIO: Esta es la NUEVA colisión precisa desde arriba
            if(colX && estabaArriba && caeEncima){
                nextY = plata.y - playerPosInicio.h;
                playerPosInicio.vy = 0;
                playerPosInicio.onGround = true;
            }
        });

        // --- ACTUALIZAR POSICIÓN REAL ---
        playerPosInicio.x = nextX;
        playerPosInicio.y = nextY;

        //En caso de que el jugador caiga x 80 y 810, como y es mayor a 360, lo reseteamos a la posición inicial
        console.log("Posición jugador:", playerPosInicio.x, playerPosInicio.y); 
        if (
            playerPosInicio.x > 80 &&
            playerPosInicio.x < 810 &&
            playerPosInicio.y > 347 
        ) {
            console.log("💥 El jugador ha caído. Volviendo al inicio...");
            console.log("------------------------:", playerPosInicio);
            playerPosInicio.x = START_X;
            playerPosInicio.y = START_Y;
            playerPosInicio.vx = 0;
            playerPosInicio.vy = 0;
            playerPosInicio.onGround = false;
            quitarUnaVida();
        }

        // límites del canvas
        if(playerPosInicio.x < 0) playerPosInicio.x = 0;
        if(playerPosInicio.x + playerPosInicio.w > CANVAS_W) playerPosInicio.x = CANVAS_W - playerPosInicio.w;
        if(playerPosInicio.y + playerPosInicio.h > CANVAS_H) {
            playerPosInicio.y = CANVAS_H - playerPosInicio.h;
            playerPosInicio.vy = 0;
            playerPosInicio.onGround = true;
        }
    }

    // Bucle principal del juego, corazón del motor de juego. Actualización del jugador, físicas, colisiones con plataformas, etc.
    function loop() {
        if (!gameActive) {
            requestAnimationFrame(loop);//Vuelve a ejecutar esta función en el próximo frame. Sin esto, el juego se detendría.
            return;
        }

        // limpiar canvas
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // dibujar plataformas
        dibujarPlataformas();
        // dibujar componente nave
        dibujarComponenteNave();
        // actualizar jugador
        actualizarJugador();
        // dibujar jugador posicion inicial
        dibujarPlayer();

        requestAnimationFrame(loop);
    }

    /* -------------- Mensajes -------------- */
    function mostrarMensaje(title, body){
        msg.style.display = 'block';
        document.getElementById('msg-title').textContent = title;
        document.getElementById('msg-body').innerHTML = body;
        gameActive = false;
    }

    function ocultarMensaje(){
        msg.style.display = 'none';
        gameActive = true;
    }

    //Resetear juego -> valores de jugador
        function resetJugador() {
        playerPosInicio.x = START_X - 40;
        playerPosInicio.y = START_Y + 65;

        keys = {};
        
        playerPosInicio.vx = 0;
        playerPosInicio.vy = 0;
        playerPosInicio.onGround = false;
    }

    //Iniciar el Juego, Ver para futuro implementar mas niveles
    function iniciarAstro() {
        gameActive = true;
        levelComplete = false;
        puntos = 0;
        nivel = LEVEL_ID; //De momento solo 1 nivel
        vidas = 3;
        erroresEnNivel = 0;

        resetJugador();
        crearNivel1();
        loop();
    }

    /* Iniciar mostrando mensaje inicial */
    mostrarMensaje("Misión Matemática - Nivel 1", "Llegar al final resolviendo sumas en las plataformas. Usa ← → para moverte, Espacio para saltar y E para interactuar con los bloques. Pulsa JUGAR para comenzar.");
    

}

window.astroJugable = iniciarAstro;