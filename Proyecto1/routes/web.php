<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RutasControlador;

//Route to get Login
Route::get('/', function () {
    return view('auth.login');
});

//Route to get Register
Route::get('/register', [RutasControlador::class, 'registroView'])->name('register.controller');
//Route to get Login
Route::get('/login', [RutasControlador::class, 'loginView'])->name('login.controller');

Route::get('/volamentes', function () {
    return view('volamentes');
});
