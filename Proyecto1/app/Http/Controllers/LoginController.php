<?php

namespace App\Http\Controllers;

use App\Models\SesionUsuario;
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
                $this->crearSesionUsuario($usuari->id);
                $response = redirect('/home'); 
            }else{
                //session()->flash('error', 'Credenciales Incorrectas');
                $response = redirect()->back()->with('Error', 'Credenciales Incorrectas. Recuerda en poner tu correo o nickName')->withInput();
            }
        }else{
            $usuari = Usuario::where('nickName', $request->input('correo'))->first();
            if($usuari && Hash::check($request->input('password'), $usuari->password)){
                Auth::login($usuari);
                $this->crearSesionUsuario($usuari->id);
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

    //Funcion para llamar al controlador de SesionUsuario y crear una nueva sesion
    public function crearSesionUsuario($id_usuario){
        $sesion = new SesionUsuario();
        $sesion->id_usuario = $id_usuario;
        $sesion->fechaSesion = now();
        $sesion->save();
    }

}
