<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\RutasControlador;
use Illuminate\Support\Facades\Route;

//Rutas en las que podremos entrar en caso de conectar-nos previamente con el login/auth
Route::middleware(['auth'])->group(function () {
//Route to get Home
    Route::get('/home', [RutasControlador::class, 'homeView'])->name('home.controller');

    Route::get('/volamentes', function () {
        return view('volamentes');
    });
});

//Al entrar en una de las rutas dentro de este apartado, se mirará si el usuario está autentificado y a parte que rol tiene (En este apartado entra SuperAdmin y Admin)
Route::middleware(['auth', 'rol: 1,2'])->group(function () {

});

//Al entrar en una de las rutas dentro de este apartado, se mirará si el usuario está autentificado y a parte que rol tiene (En este apartado entra SuperAdmin)
Route::middleware(['auth', 'rol: 1'])->group(function () {

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
