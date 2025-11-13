<?php
namespace App\Http\Controllers;

class RutasControlador extends Controller
{
    public function registroView()
    {
        return view('auth.register');
    }

    public function loginView()
    {
        return view('auth.login');
    }
} 