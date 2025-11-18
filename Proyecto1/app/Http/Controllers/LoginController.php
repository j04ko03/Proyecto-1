<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    //Lo puedo Borrar XQ NO LA USARE
    public function showLoginForm(){
        return view('auth.login');
    }

    public function loginF(Request $request) {
        $usuari = Usuario::where('email', $request->input('correo'))->first();
        if($usuari){
            if($usuari && Hash::check($request->input('password'), $usuari->password)){
                Auth::login($usuari);
                $response = redirect('/home'); 
            }else{
                //session()->flash('error', 'Credenciales Incorrectas');
                $response = redirect()->back()->with('Error', 'Credenciales Incorrectas. Recuerda en poner tu correo o nickName')->withInput();
            }
        }else{
            $usuari = Usuario::where('nickName', $request->input('correo'))->first();
            if($usuari && Hash::check($request->input('password'), $usuari->password)){
                Auth::login($usuari);
                $response = redirect('/home'); 
            }else{
                //session()->flash('error', 'Credenciales Incorrectas');
                $response = redirect()->back()->with('Error', 'Credenciales Incorrectas. Recuerda en poner tu correo o nickName')->withInput();
            }
        }
        

        return $response;

    }

    public function doLogout(){
        Auth::logout();
        return redirect(route('login.controller'));
    }

}
