<?php

namespace App\Http\Controllers;

use App\Models\SesionUsuario;
use App\Models\Usuario;
use Hash;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use App\Clases\Utilitat;

class LoginController extends Controller
{
    //Lo puedo Borrar XQ NO LA USARE
    /**
     * Muestra el formulario de inicio de sesión.
     *
     * (Actualmente no se utiliza, pero se mantiene por compatibilidad.)
     *
     * @return \Illuminate\View\View
     */
    public function showLoginForm(){
        return view('auth.login');
    }

    /**
     * Procesa el login de un usuario.
     *
     * Intenta autenticar usando email o nickname.
     * Si las credenciales son válidas, inicia sesión y crea una nueva
     * entrada en SesionUsuario. En caso contrario redirige con error.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function loginF(Request $request) {
        try{
            $usuari = Usuario::where('email', $request->input('correo'))->first();
            if($usuari){
                if($usuari && Hash::check($request->input('password'), $usuari->password)){
                    Auth::login($usuari);
                    $this->crearSesionUsuario($usuari->id);
                    $response = redirect('/home'); 
                    session()->flash('success', 'Login con email realizado');
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
                    session()->flash('success', 'Login con nickname  realizado');
                }else{
                    //session()->flash('error', 'Credenciales Incorrectas');
                    $response = redirect()->back()->with('Error', 'Credenciales Incorrectas. Recuerda en poner tu correo o nickName')->withInput();
                }
            }
        }catch(QueryException $e){
            $missatge = Utilitat::errorMessage($e);
            session()->flash('error', 'No es poden obtenir les dades indicades' . ' - ' . $missatge);
            $response = redirect('/home'); 
        }

        return $response;

    }

    /**
     * Cierra la sesión del usuario autenticado.
     *
     * Realiza logout utilizando Auth::logout() y redirige a la ruta login.
     * Si ocurre un error, redirige atrás con mensaje.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function doLogout(){
        try{
            Auth::logout();
            $response = redirect(route('login.controller'));
        }catch(QueryException $e){
            $missatge = Utilitat::errorMessage($e);
            session()->flash('error', 'No se ha podido salir de la sesion' . ' - ' . $missatge);
            $response = redirect()->back()->with('Error', 'Error al hacer Logout, intentalo de nuevo')->withInput();
        }
        return $response;
    }

    //Funcion para llamar al controlador de SesionUsuario y crear una nueva sesion
    /**
     * Crea una nueva sesión de usuario (SesionUsuario) al iniciar sesión.
     *
     * Inserta un registro indicando la fecha y el usuario que inicia sesión.
     *
     * @param  int  $id_usuario  ID del usuario autenticado.
     * @return void
     */
    public function crearSesionUsuario($id_usuario){
        try{
            $sesion = new SesionUsuario();
            $sesion->id_usuario = $id_usuario;
            $sesion->fechaSesion = now();
            $sesion->save();
        }catch(QueryException $e){
            $missatge = Utilitat::errorMessage($e);
            session()->flash('error', 'No se ha podido crear el usuario' . ' - ' . $missatge);
        }
    }

}
