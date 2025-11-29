window.iniciarAstro = function () {
    console.log("🚀 Astro Jugable iniciado");
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    /*
      Misión Matemática — Nivel 1 (sencillo, pixel retro)
      Autor: Prototipo instantáneo
      Controles: Flechas izquierda/derecha, Espacio para saltar, E para interactuar con bloque
    */

    let loopId; // ID del bucle principal

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


    /* Puntuación */
    let puntos = 0;

    let vidas = 3;
    let nivel = 1;
    let erroresEnNivel = 0;
    let taxaErrores = 0;
    let numeroIntentos = 0;
    let ayudas = 0;

    /* Datos Sesion */
    let datosSesionIdX = 0;
    let isReturningPlayer = false;

    /* Estado del juego */
    let keys = {};
    let modalOpen = false;
    let gameActive = false;
    let levelComplete = false;

    /* Carga Pieza IMg */
    const imgNave = new Image();
    imgNave.src = '/Proyecto-1/Proyecto1/Astro/motor.png';

    /* Carga de imagen andando Capi */
    const imagenCapiPieIzquierda        = new Image();
    const imagenCapiPieIzquierdaAnda    = new Image();
    const imagenCapiPieDerecha          = new Image();
    const imagenCapiPieDerechaAnda      = new Image();
    const imageCapiSaltoIzquierda       = new Image();
    const imageCapiSaltoDerecha         = new Image();

    imagenCapiPieIzquierda.src =        '/Proyecto-1/Proyecto1/Astro/pie1izquierda.png';
    imagenCapiPieIzquierdaAnda.src =    '/Proyecto-1/Proyecto1/Astro/pie2izquierda.png';
    imagenCapiPieDerecha.src =          '/Proyecto-1/Proyecto1/Astro/paso1derecha.png';
    imagenCapiPieDerechaAnda.src =      '/Proyecto-1/Proyecto1/Astro/paso2derecha.png';
    imageCapiSaltoIzquierda.src =       '/Proyecto-1/Proyecto1/Astro/salto2izquierda.png';
    imageCapiSaltoDerecha.src =         '/Proyecto-1/Proyecto1/Astro/salto2derecha.png';

    const capiAnda = imagenCapiPieDerecha;


    /* UI referencias */
    const msg       = document.getElementById('mensaje');
    const startBtn  = document.getElementById('start-btn');
    const nivelEl   = document.getElementById('nivel');
    const vidasEl   = document.getElementById('vidas');
    const puntosEl  = document.getElementById('puntos');
    const timmer    = document.getElementById('mejor');
    


    /* Modal pregunta */
    const modal = document.getElementById('modal');
    const preguntaText = document.getElementById('pregunta-text');
    const respuestaInput = document.getElementById('respuesta-input');
    const cancelBtn = document.getElementById('cancel-btn');
    const submitBtn = document.getElementById('submit-btn');

    /* Vidas */
    const cor1 = document.getElementById('cor1');
    const cor2 = document.getElementById('cor2');
    const cor3 = document.getElementById('cor3');   

    /* Timmer del Juego*/
    let tiempoTranscurrido = null;
    let timmerId = null;

    //Funcion Internacional para modificar segundos a formato hh:mm:ss
    function formatTiempo(segundos) {
        const h = Math.floor(segundos / 3600);
        const m = Math.floor((segundos % 3600) / 60);
        const s = segundos % 60;

        // Añadir cero a la izquierda si es menor que 10
        const hh = h.toString().padStart(2, '0');
        const mm = m.toString().padStart(2, '0');
        const ss = s.toString().padStart(2, '0');

        return `${hh}:${mm}:${ss}`;
    }

    function iniciarTimmer(){
        tiempoTranscurrido = 0;
        timmer.textContent = formatTiempo(tiempoTranscurrido);

        if(timmerId){
            clearInterval(timmerId)
        }

        timmerId = setInterval(() => {
            //if (!gameActive) return; // solo contar si el juego está activo

            tiempoTranscurrido++;
            timmer.textContent = formatTiempo(tiempoTranscurrido);

        }, 1000); // cada segundo
    }

    function pausarTimer() {
        if(timmerId){
            clearInterval(timmerId);
            timmerId = null;
        }
    }

    startBtn.addEventListener('click', () => {
        console.log("Iniciar juego pulsado, cerrando Mensaje....");
        ocultarMensaje();

        //Iniciar el juego Y Timmer
        iniciarTimmer();

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
        w: 46, 
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

    function crearNivel2(){
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

        console.log("Plataformas nivel 2 creadas:", plataformas);
    }

    function crearNivel3(){
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

        console.log("Plataformas nivel 3 creadas:", plataformas);
    }

    function crearNivel4(){
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

        console.log("Plataformas nivel 4 creadas:", plataformas);
    }

    function crearNivel5(){
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

        console.log("Plataformas nivel 5 creadas:", plataformas);
    }

    //Dibujar plataformas en nivel
    function dibujarPlataformas(){
        ctx.fillStyle = "#000"; // color marrón para plataformas TODO->CAMBIAR POR IMAGEN
        plataformas.forEach(plata => {
            ctx.fillRect(
                toScreenX(plata.x),
                toScreenY(plata.y),
                toScreenW(plata.w),
                toScreenH(plata.h)
            );
            dibujarRectanguloRedondeado(plata);
        });
    };

    //Dibujar rectángulo con esquinas redondeadas para pieza de pregunta, se le pasara la lpataforma por contexto
    function dibujarRectanguloRedondeado(plataformaArg) {
        if(!plataformaArg.hasBlock || plataformaArg.blockAnswered)return;
        const x = toScreenX(plataformaArg.x + plataformaArg.w / 2 - 10);
        const y = toScreenY(plataformaArg.y - 50);
        const w = 20;
        const h = 20;

        ctx.fillStyle = "#F9C74F"; // fondo
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = "#000"; // borde
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = "#000"; // ?
        ctx.font = "16px monospace";
        ctx.fillText("?", x + 6, y + 16);
    }


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

    //Determinar recurso de imagen de naveç
    function determinarRecursoNave(){
        switch(nivel){
            case 1:
                imgNave.src = '/Proyecto-1/Proyecto1/Astro/motor.png';
                break;
            case 2:
                imgNave.src = '/Proyecto-1/Proyecto1/Astro/ala.png';
                break;
            case 3:
                imgNave.src = '/Proyecto-1/Proyecto1/Astro/ala.png';
                break;
            case 4: 
                imgNave.src = '/Proyecto-1/Proyecto1/Astro/cabina.png';
                break;
            case 5: 
                imgNave.src = '/Proyecto-1/Proyecto1/Astro/cabina.png';
                break;
            default: 
                imgNave.src = '/Proyecto-1/Proyecto1/Astro/motor.png';
                break;
        }
        
    }

    //Dibujar componente nave
    function dibujarComponenteNave(){
        //Switch para determinar que componente se dibuja en cada nivel

        if(!componenteNave1.obtained){
            determinarRecursoNave(); ///------------------------------------------------>>> Comportamiento switch que detecta en que nivel esta y carga una imagen u otra
            console.log("Dibujando componente nave 1------------------------------------");
            ctx.fillStyle = '#c361f4ff';
            rectanguloPieza(ctx, componenteNave1.x, componenteNave1.y, componenteNave1.w, componenteNave1.h, 4, true, false);
            
                ctx.drawImage(
                    imgNave,
                    componenteNave1.x,      // posición x
                    componenteNave1.y,      // posición y
                    componenteNave1.w,      // ancho
                    componenteNave1.h       // alto
                );  

                //centrar texto
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
        ctx.drawImage(
            capiAnda,
            playerPosInicio.x,
            playerPosInicio.y,
            playerPosInicio.w * 1.4,
            playerPosInicio.h * 1.4
        );
    }

    //Añado eventos de teclado para saber qué teclas están presionadas y que teclas se sueltan
    window.addEventListener('keydown', function (e) {
        keys[e.code] = true;
        console.log("Tecla presionada:", e.code);

        //controlar la imagen de capi actual para ir variandola
        if(e.code == "ArrowRight" || e.code == "KeyD"){
            if(capiAnda.src === imagenCapiPieDerecha.src){
                capiAnda.src = imagenCapiPieDerechaAnda.src;
            }else if(capiAnda.src === imagenCapiPieDerechaAnda.src) {
                capiAnda.src = imagenCapiPieDerecha.src;
            }else{
                capiAnda.src = imagenCapiPieDerecha.src;
            }
        }else if(e.code == "ArrowLeft" || e.code == "KeyA"){
            if (capiAnda.src === imagenCapiPieIzquierda.src) {
                capiAnda.src = imagenCapiPieIzquierdaAnda.src;
            } else if (capiAnda.src === imagenCapiPieIzquierdaAnda.src){
                capiAnda.src = imagenCapiPieIzquierda.src;
            }else{
                capiAnda.src = imagenCapiPieIzquierda.src;
            }
        }else if(e.code == "Space" || e.code == "KeyW" || e.code == "ArrowUp"){ //TODO Controlar imagen de salto 
            if(capiAnda.src == imageCapiSaltoIzquierda.src){
                capiAnda.src == imageCapiSaltoDerecha.src;
            }else{
                capiAnda.src == imageCapiSaltoIzquierda.src;
            }
        }
    });
    window.addEventListener('keyup', function (e) {
        keys[e.code] = false;
        console.log("Tecla soltada:", e.code);
    });

    function reiniciarVidas(){
        cor1.src = '/Proyecto-1/Proyecto1/Astro/corazon.png';
        cor2.src = '/Proyecto-1/Proyecto1/Astro/corazon.png';
        cor3.src = '/Proyecto-1/Proyecto1/Astro/corazon.png';
        vidas = 3;
        vidasEl.textContent = vidas;
    }
    
    function quitarUnaVida(){
        Respuesta(false); // Quitar puntos por error al caer
        vidas -= 1;
        vidasEl.textContent = vidas;

        switch(vidas){
            case 2:
                cor3.src = '/Proyecto-1/Proyecto1/Astro/corazonless.png';
                break;
            case 1:
                cor2.src = '/Proyecto-1/Proyecto1/Astro/corazonless.png';
                break;
            case 0:
                cor1.src = '/Proyecto-1/Proyecto1/Astro/corazonless.png';
                break;
        }

        if(vidas === 0){
            numeroIntentos += 1;
            pausarTimer();

            gameActive = false;
            mostrarMensaje("Juego Terminado", "Has perdido todas tus vidas. Pulsa JUGAR para reiniciar.");
            
            cancelAnimationFrame(loopId);

            reiniciarVidas();
            resetJugador();
        }
    }

    //Verificar que hay una colisiion del personage con la pieza final
    function detectarColisionComponenteNave() {
        if (componenteNave1.obtained) return false;

        const JX = playerPosInicio.x;
        const JY = playerPosInicio.y;
        const JW = playerPosInicio.w;
        const JH = playerPosInicio.h;

        const NX = componenteNave1.x;
        const NY = componenteNave1.y;
        const NW = componenteNave1.w;
        const NH = componenteNave1.h;

        // Colisión rectangular simple
        const colision =
            JX < NX + NW &&
            JX + JW > NX &&
            JY < NY + NH &&
            JY + JH > NY;

        if (colision) {
            componenteNave1.obtained = true;

            // ✔ Dar puntos
            puntos += 300;
            puntosEl.textContent = puntos;

            // ✔ Mostrar mensaje
            mostrarMensaje(
                "¡Componente recuperado!",
                "Has recuperado la pieza de la nave. ¡Llegaste al final del nivel!"
            );

            // ✔ Parar el juego
            gameActive = false;

            pausarTimer();
            cancelAnimationFrame(loopId);
            if(nivel < 5){
                nivel += 1;
            }

            //Guardar los datos del nivel em SesionUsuario
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            fetch('/Proyecto-1/Proyecto1/public/juegos/astro/finalizar', {
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
                    errores:  erroresEnNivel,
                    puntuacion: puntos,
                    helpclicks: ayudas,
                    returningPlayer: isReturningPlayer      
                })
            })
            .then(res => res.json())
            .then(data => {
                console.log("Controlador ejecutado: Gurdado en Base de datos", data.status);
                
                //Los intens del nivel se resetean
                numeroIntentos = 0;

                //Hacemos el fech de iniciación pero sin iniciar loop asi no se sobreescribe siempre el mismo id de SesionUsuario también sacamos el nuevo nivel en que está el usuario
                /////////////////////////////////////////////////////////////////////////////////// ////////////////////////////////////////////////////////////////////////
                const dades = extreureCookie("user");
                const usuarioIdx = dades.user;                  //  obtén esto de sesión, localStorage o backend   creo que se puude borrar -> TODO
                const juegoIdx = parseInt(dades.game);          //  ID del juego Astro

                fetch('/Proyecto-1/Proyecto1/public/juegos/astro/actualizar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: JSON.stringify({
                        usuarioId: usuarioIdx
                    })
                })
                .then(res => res.json())
                .then(data => {
                    //nivel = data.nivel;
                    nivelEl.textContent = nivel;
                    datosSesionIdX = data.datosSesionId;
                }).catch(err => {
                    console.error("ERROR EN FETCH:", err);
                });
                ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            }).catch(err => {
                console.error("ERROR EN FETCH:", err);
            });
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


            // Ir al nivel 2 después de 1.5 segundos
            setTimeout(() => {
                //componenteNave1.obtained = false;
                reiniciarVidas();
                resetJugador();
                crearJuego(); //Todo verificar
            }, 1500);

            return true;
        }

        return false;
    }


    //Actualización de la posición del jugador
    function actualizarJugador() {
        //Si el jugador tiene una pregunta abierta no se actualiza su posición
        // Añado apartado de que si el jugador apreta la tecla e interactúe con el bloque de pregunta

        if(keys['KeyE']) {
            console.log("Interaccion con bloque de pregunta");
            plataformas.forEach(plata => {
                if(plata.hasBlock && !plata.blockAnswered){
                    if(detectarInteraccionPlataforma(plata)){
                        abrirModalPregunta(plata);
                    }        
                }
            });
        }


        if(modalOpen) return;

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

            //colisión precisa desde arriba
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

    //Detectar si el jugador está cerca de una plataforma interactiva la plataforma interactiva tiene el atributo hasblock a true
    function detectarInteraccionPlataforma(plataforma){
        // Coordenadas reales del jugador
        const JX = playerPosInicio.x;
        const JY = playerPosInicio.y;
        const JW = playerPosInicio.w;
        const JH = playerPosInicio.h;

        // Coordenadas reales del bloque
        const BX = plataforma.x;
        const BY = plataforma.y;
        const BW = plataforma.w;
        const BH = plataforma.h;

        // Calcular centro de jugador y bloque
        const jugadorCentroX = JX + JW/2;
        const jugadorCentroY = JY + JH/2;

        const bloqueCentroX = BX + BW/2;
        const bloqueCentroY = BY + BH/2;

        // Distancia real
        const distanciaX = Math.abs(jugadorCentroX - bloqueCentroX);
        const distanciaY = Math.abs(jugadorCentroY - bloqueCentroY);

        let interactuar = false;
        //Para interactuar debe de estar cerca, entre estos valores
        if(distanciaX < 30 && distanciaY < 50){
            console.log("El jugador está cerca de una plataforma interactiva!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            interactuar = true;
        }

        return interactuar;
    }

    function anadirPreguntasnivel(nivel){//Se le puede pasar por parámetro el nivel para la creación de preguntas
        let indices = null;
        switch(nivel){
            case 1:
                indices = [2, 3, 4, 5, 6];
                break;
            case 2:
                indices = [2, 3, 4, 5, 6];
                break;
            case 3:
                indices = [2, 3, 4, 5, 6];
                break;
            case 4:
                indices = [2, 3, 4, 5, 6];
                break;
            case 5:
                indices = [2, 3, 4, 5, 6];
                break;
            default:
                indices = [2, 3, 4, 5, 6];
                break;
        }
        indices.forEach(i => {
            const preguntita = generadorPreguntas(nivel);//solo sumas por ahora
            plataformas[i].hasBlock = true;
            plataformas[i].preguntaText = preguntita.texto;
            plataformas[i].respuesta = preguntita.correcta;
            plataformas[i].blockAsked = false;
            plataformas[i].blockAnswered = false;
        });
    }

    //Método para crear una función que genere según el nivel una pregunta u otra
    function generadorPreguntas(nivel){
        let operador1, operador2, operacion, respuesta;

        switch(nivel){
            case 1: //sumas
                operacion = "+";
                operador1 = Math.floor(Math.random() * 100) + 1; //Hasta cien
                operador2 = Math.floor(Math.random() * 100) + 1;
                respuesta = operador1 + operador2;
                break;
            case 2://restas
                operacion = "-";
                operador1 = Math.floor(Math.random() * 100) + 1; //Hasta cien
                operador2 = Math.floor(Math.random() * 100) + 1;
                respuesta = operador1 - operador2;
                break;
            case 3://multiplicaciones
                operacion = "*";
                operador1 = Math.floor(Math.random() * 10) + 1; //Hasta cien
                operador2 = Math.floor(Math.random() * 10) + 1;
                respuesta = operador1 * operador2;
                break;
            case 4://Divisiones
                const divisor = Math.floor(Math.random() * 9) + 2; // 2–10
                const dividendo = divisor * (Math.floor(Math.random() * 10) + 1); // múltiplo exacto
                operador1 = dividendo;
                operador2 = divisor;
                operacion = "÷";
                respuesta = dividendo / divisor;
            case 5://Mixto
                const operacionesRandom = [1, 2, 3, 4];
                return generadorPreguntas(operacionesRandom[Math.floor(Math.random() * 4)]);
            default:
                break;
        }

        return { 
            texto: `${operador1} ${operacion} ${operador2}`, 
            correcta: respuesta 
        };

    }


    //Método para abrir las preguntas
    function abrirModalPregunta(plataforma){
        console.log("Abriendo modal de pregunta para la plataforma:", plataforma.preguntaText);
        console.log(plataforma);

        if(modalOpen) return; // Si ya está abierto, no hacer nada

        modalOpen = true;
        gameActive = false;

        plataformaActual = plataforma;

        modal.style.display = 'block';
        preguntaText.textContent = "¿Cuánto es: " + plataforma.preguntaText + "?"; // Aquí iría la pregunta real

        respuestaInput.value = '';
        respuestaInput.focus();

        plataforma.blockAsked = true;

    }

    function cerrarModalPregunta(){
        modalOpen = false;
        gameActive = true;
        modal.style.display = 'none';
        loop();
    }

    function Respuesta(respuesta){
        if(respuesta){
            puntos += 100;
            puntosEl.textContent = puntos;
        }else{
            erroresEnNivel += 1;
            switch(erroresEnNivel){
                case 0:
                    taxaErrores = 0;
                    break;
                case 1:
                    taxaErrores = 0.1;
                    break;
                case 2:
                    taxaErrores = 0.25;
                    break;
                case 3:
                    taxaErrores = 0.5;
                    break;
                case 4:
                    taxaErrores = 0.75;
                    break;
                case 5:
                    taxaErrores = 1;
                    break;
                default:
                    taxaErrores = 1;
                    break;
            }     
            puntos = puntos - Math.floor(puntos * taxaErrores); 
            puntosEl.textContent = puntos; 
        }
    }

    submitBtn.addEventListener('click', () => {
        //Mostrar la plataforma ya contiene la pregunta respuestaetc
        console.log("----------------------------------" + plataformaActual);

        const respuesta = parseInt(respuestaInput.value.trim());
        console.log("Respuesta enviada:", respuesta);
        
        // Aquí la lógica para verificar la respuesta
        if (respuesta === plataformaActual.respuesta) { 
            
            plataformaActual.blockAnswered = true;

            Respuesta(true);
        }else{
            Respuesta(false);
        }

        cerrarModalPregunta();

    });

    cancelBtn.addEventListener('click', () => {
        console.log("Cerrando modal de pregunta sin responder");
        cerrarModalPregunta();
    });

    // Bucle principal del juego, corazón del motor de juego. Actualización del jugador, físicas, colisiones con plataformas, etc.
    function loop() {
        if(vidas > 0){
            if (!gameActive) {
                //requestAnimationFrame(loop);//Vuelve a ejecutar esta función en el próximo frame. Sin esto, el juego se detendría.
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
            // ver si se recoge la pieza
            detectarColisionComponenteNave();
            // dibujar jugador posicion inicial
            dibujarPlayer();

            loopId = requestAnimationFrame(loop);
        }
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
        const dades = extreureCookie("user");
        const usuarioIdx = dades.user;                  //  obtén esto de sesión, localStorage o backend
        const juegoIdx = parseInt(dades.game);          //  ID del juego Astro

        fetch('/Proyecto-1/Proyecto1/public/juegos/astro/iniciar', {
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
            console.log("Controlador ejecutado:", data);
            // Aquí comienzas el juego:
            
            gameActive = true;
            levelComplete = false;
            puntos = 0;
            puntosEl.textContent = puntos;
            if(!componenteNave1.obtained){
                nivel = data.nivel['id'];
            }
            datosSesionIdX = data.datosSesionId;
            nivelEl.textContent = nivel;
            componenteNave1.obtained = false;
            vidas = 3;
            erroresEnNivel = 0;

            resetJugador(); 

            //Crea dinamicamente los juegos en funcion al nivel
            crearJuego(nivel);
            
            loop();

        }).catch(err => {
            console.error("ERROR EN FETCH:", err);
        });

    }

    function crearJuego(nivel){
        switch(nivel){
                case 1:
                    crearNivel1();
                    anadirPreguntasnivel(nivel); //Crea las preguntas de modo random para los modales
                    break;
                case 2:
                    crearNivel2();
                    anadirPreguntasnivel(nivel);
                    break;
                case 3:
                    crearNivel3();
                    anadirPreguntasnivel(nivel);
                    break;
                case 4: 
                    crearNivel4();
                    anadirPreguntasnivel(nivel);
                    break;
                case 5:
                    crearNivel5();
                    anadirPreguntasnivel(nivel);
                    break;
                default:
                    crearNivel1();
                    anadirPreguntasnivel(nivel);
                    break;
            }
    }

    function extreureCookie(clau) {
        const cookies = document.cookie.split('; ');
        let vuelta = null;
        for (let c of cookies) {
            const [key, value] = c.split('=');
            if (key === clau){
                vuelta = JSON.parse(value);
            }
        }
        return vuelta;
    }

    /* Iniciar mostrando mensaje inicial */
    mostrarMensaje("Misión Matemática - Nivel 1", "Llegar al final resolviendo sumas en las plataformas. Usa ← → para moverte, Espacio para saltar y E para interactuar con los bloques. Pulsa JUGAR para comenzar.");
    

}

window.astroJugable = iniciarAstro;