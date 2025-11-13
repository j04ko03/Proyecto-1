<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('login.login');
});

Route::get('/volamentes', function () {
    return view('volamentes');
});
