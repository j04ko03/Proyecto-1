/**
 * Módulo de Recursos para Bosque.js
 * Gestiona la carga y almacenamiento de imágenes.
 * @namespace BosqueRecursos
 */
(function () {
    console.log("Cargando recursos de Bosque...");

    const Recursos = {
        // Estado de las imágenes
        images: {
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
        },

        /**
         * Carga todas las imágenes necesarias para el juego.
         * Utiliza promesas para asegurar que todo esté listo antes de comenzar.
         * @returns {Promise<void>} Promesa que se resuelve cuando todas las imágenes cargan.
         */
        loadImages: function () {
            return new Promise((resolve) => {
                const baseUrl = window.assetBaseUrl || '';

                const imagesToLoad = [
                    // Personaje
                    { key: 'personajeIdleDerecha', src: baseUrl + 'img/juegos/bosque/personaje/idle-derecha.png' },
                    { key: 'personajeIdleIzquierda', src: baseUrl + 'img/juegos/bosque/personaje/idle-izquierda.png' },
                    { key: 'personajeCaminarDerecha', src: baseUrl + 'img/juegos/bosque/personaje/caminar-derecha.png' },
                    { key: 'personajeCaminarIzquierda', src: baseUrl + 'img/juegos/bosque/personaje/caminar-izquierda.png' },
                    { key: 'personajeSaltoDerecha', src: baseUrl + 'img/juegos/bosque/personaje/salto-derecha.png' },
                    { key: 'personajeSaltoIzquierda', src: baseUrl + 'img/juegos/bosque/personaje/salto-izquierda.png' },

                    // Obstáculos
                    { key: 'puente', src: baseUrl + 'img/juegos/bosque/obstaculos/puente.png' },
                    { key: 'arbol', src: baseUrl + 'img/juegos/bosque/obstaculos/arbol.png' },
                    { key: 'roca', src: baseUrl + 'img/juegos/bosque/obstaculos/roca.png' },
                    { key: 'flor', src: baseUrl + 'img/juegos/bosque/obstaculos/flor.png' },
                    { key: 'rio', src: baseUrl + 'img/juegos/bosque/obstaculos/rio.png' },
                    { key: 'cueva', src: baseUrl + 'img/juegos/bosque/obstaculos/cueva.png' },

                    // UI
                    { key: 'corazonLleno', src: baseUrl + 'img/juegos/bosque/ui/corazon-lleno.png' },
                    { key: 'corazonVacio', src: baseUrl + 'img/juegos/bosque/ui/corazon-vacio.png' }
                ];

                this.images.totalImages = imagesToLoad.length;
                this.images.loadedImages = 0;

                // Si no hay imágenes, resolver la promesa inmediatamente
                if (imagesToLoad.length === 0) {
                    console.log("No hay imágenes para cargar");
                    this.images.loaded = false;
                    resolve();
                    return;
                }

                imagesToLoad.forEach(imgData => {
                    const img = new Image();

                    img.onload = () => {
                        this.images.loadedImages++;
                        // console.log(`Imagen cargada: ${imgData.key} (${this.images.loadedImages}/${this.images.totalImages})`);

                        if (this.images.loadedImages === this.images.totalImages) {
                            this.images.loaded = true;
                            console.log("Todas las imágenes cargadas");
                            resolve();
                        }
                    };

                    img.onerror = () => {
                        this.images.loadedImages++;
                        console.warn(`Error cargando: ${imgData.src}`);

                        if (this.images.loadedImages === this.images.totalImages) {
                            this.images.loaded = true; // Continuar aunque falten imágenes
                            console.log("Carga de imágenes completada (con errores)");
                            resolve();
                        }
                    };

                    img.src = imgData.src;
                    this.images[imgData.key] = img;
                });
            });
        }
    };

    // Exponer al scope global
    window.BosqueRecursos = Recursos;

})();
