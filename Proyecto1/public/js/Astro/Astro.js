window.iniciarAstro = function() {
    console.log("🚀 Astro Jugable iniciado");
    const botons = document.getElementById('PROVA');
    if(botons){
        botons.addEventListener('click', () => {
            alert('AAAAAAAAAAAAAAAAAAAA');
        });
    }else {
        console.warn("Botón #PROVA no encontrado");
    }

    document.addEventListener('keydown', (event) => {
        console.log(`Tecla presionada: ${event.key}`);
    });

}

window.astroJugable = iniciarAstro;