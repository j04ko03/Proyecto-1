<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;

Route::get('/', function () {
    return view('login.login');
});

Route::get('/volamentes', function () {
    return view('volamentes');
});

Route::get('/home', [HomeController::class, 'index']);