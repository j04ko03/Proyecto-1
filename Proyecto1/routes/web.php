<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\JuegoController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\RutasControlador;
use App\Http\Controllers\UsuarioController;

//Rutas en las que podremos entrar en caso de conectar-nos previamente con el login/auth
Route::middleware(['auth'])->group(function () {
//Route to get Home
    Route::get('/home', [HomeController::class, 'index'])->name('home.controller');

    Route::get('/Astro', [RutasControlador::class, 'juego1View'])->name('astro.controller');

    Route::get('/CapiMates', [RutasControlador::class, 'juego3View'])->name('capi.controller');
    
    Route::get('/Bosque', [RutasControlador::class, 'juego4View'])->name('bosque.controller');

    Route::get('/Volamentes', [RutasControlador::class, 'juego2View'])->name('volamentes.controller');
});

// Route::get('/filtrar', [HomeController::class, 'filtrar'])->name('filtrar.controller');

//Al entrar en una de las rutas dentro de este apartado, se mirará si el usuario está autentificado y a parte que rol tiene (En este apartado entra SuperAdmin y Admin)
Route::middleware(['auth', 'rol: 1,2'])->group(function () {
    //Rutas que comparten SuperAdmin y Admin. TODO-> Limpiar esta línea
    Route::get('/usuarios', [RutasControlador::class, 'usuariosView'])->name('usuarios.controller');
});

//Al entrar en una de las rutas dentro de este apartado, se mirará si el usuario está autentificado y a parte que rol tiene (En este apartado entra SuperAdmin)
Route::middleware(['auth', 'rol: 1'])->group(function () {
    //Rutas de SuperAdmin, añadir aqui. TODO-> Limpiar esta línea
});

//Rutas públicas en el que el usuario no autentificado puede acceder
//Route to get Login
Route::get('/', function () {
    return view('auth.login');
});

//Route to get Register
Route::get('/register', [RutasControlador::class, 'registroView'])->name('register.controller');

//Route to get Login
Route::get('/login', [RutasControlador::class, 'loginView'])->name('login.controller');
Route::post('/login', [LoginController::class, 'loginF'])->name('login.submit');

//Route to get Logout doLogout
Route::get('/logout', [LoginController::class, 'doLogout'])->name('logout.controller');

//RUTAS PARA LOS CONTROLADORES CREADOS
    //Si queremos importar todas las metodologías de la classe, se hace así ->
Route::resource('usuarios', UsuarioController::class);

//Rutas para implementar datos con el juego de Astro
Route::post('/juegos/astro/iniciar', [JuegoController::class, 'iniciarJuegoAstro']);
Route::post('/juegos/astro/finalizar', [JuegoController::class, 'finalizarNivel']);
Route::post('/juegos/astro/actualizar', [JuegoController::class, 'actualizaDatosSesionNivel']);
Route::post('/juegos/astro/desbloquear', [JuegoController::class, 'desbloquearJuego']);
