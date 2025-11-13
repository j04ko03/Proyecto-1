<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>HOME</title>
    <link rel="stylesheet" href="css/estilos/style.css">
</head>
<body>
    <div class="consola">
        <svg src="{{ public('img/consola.vsg') }}"></svg>
        <div class="interiorConsola">
                <div class="izquierda">
                    <button class="d-pad-up" data-key="w" data-direction="up">
                        <span class="d-pad-w"></span>
                    </button>
                    <button class="d-pad-right" data-key="d" data-direction="right">
                        <span class="d-pad-d"></span>
                    </button>
                    <button class="d-pad-left" data-key="a" data-direction="left">
                        <span class="d-pad-a"></span>
                    </button>
                    <button class="d-pad-down" data-key="s" data-direction="down">
                        <span class="d-pad-s"></span>
                    </button>
                </div>
                <div class="pantallaConsola">
                    <canvas id="pantallaJuego"></canvas>
                </div>
                <div class="derecha">
                    <button class="d-button-left" data-key="space" data-direction="jump">
                        <span class="d-button-A"></span>
                    </button>
                    <button class="d-button-right" data-key="e" data-direction="interact">
                        <span class="d-button-B"></span>
                    </button>
                </div>
        </div>
    </div>

    <div class="cartuchos">
        <div id="cartucho" class="cartucho1"></div>
        <div id="cartucho" class="cartucho2"></div>
        <div id="cartucho" class="cartucho3"></div>
        <div id="cartucho" class="cartucho4"></div>
    </div>

</body>


</html>
