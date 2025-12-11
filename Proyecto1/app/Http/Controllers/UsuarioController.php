<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\SesionUsuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->id_rol == 1){
            $usuario = Usuario::whereIn('id_rol', [2,3])->paginate(12);
        }

        else if ($user->id_rol == 2){
            $usuario = Usuario::where('id_rol', 3)->paginate(12);
        }

        else{
            $usuario = collect();
        }

        return view('usuarios.index', compact('usuario'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //Enviamos a la vista del registro
        return view('auth.register');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //Recibimos el $request que nos trae los datos del formulario con los name
        $validated = $request->validate([
            'nombre'        => 'nullable|string|max:50',
            'apellido1'     => 'nullable|string|max:50',
            'apellido2'     => 'nullable|string|max:50',
            'nickname'      => 'required|string|max:50|unique:Usuario,nickName', //Evita inserts duplicados antes de llegar a sqlserver
            'email'        => 'required|string|email|max:255|unique:Usuario',
            'password'      => 'required|string|min:8|max:200|confirmed',
            'admin_secret'  => 'nullable|string'
        ],[
            'nickname.unique'       => 'Este nickname ya está en uso en nuestro servidor. Prueba con otro',
            'email.unique'          => 'Debe ser un correo real y que no esté en uso en el servidor',
            'password.min'          => 'Debes introducir almenos 8 carácteres',
            'password.confirmed'    => 'Las contraseñas no coinciden'
        ]);

        $secret_admin_key = 'x2AppJocsx2SysAdmin';

        if(!$request->admin_secret){
            $id_rol = 3;
        }else{
            //Campo no null
            if($request->admin_secret === $secret_admin_key){
                $id_rol = 2;
            }else{
                $id_rol = 3;
            }
        }

        //Aplicamos valores a los campos de la BDD con los atributos del validate
        $usuario = Usuario::create([
            'nombre'        => $validated['nombre'],
            'apellido1'     => $validated['apellido1'],
            'apellido2'     => $validated['apellido2'],
            'nickName'      => $validated['nickname'],
            'id_rol'        => $id_rol,
            'email'         => $validated['email'],
            'password'      => bcrypt($validated['password'])
        ]);

        Auth::login($usuario);

        $this->crearSesionUsuario($usuario->id);

        return redirect()->route('home.controller')->with('success', '¡Cuenta creada exitosamente!');

    }

    /**
     * Display the specified resource.
     */
    public function show(Usuario $usuario)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Usuario $usuario)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Usuario $usuario)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $auth = auth()->user();          // Usuario que está logueado
        $target = Usuario::find($id);    // Usuario a eliminar

        if (!$target) {
            return back()->with('error', 'Usuario no encontrado.');
        }

        // No eliminarse a sí mismo
        if ($auth->id == $target->id) {
            return back()->with('error', 'No puedes eliminar tu propio usuario.');
        }

        if (
            ($auth->id_rol == 1 && ($target->id_rol == 2 || $target->id_rol == 3)) ||
            ($auth->id_rol == 2 && $target->id_rol == 3)
        ) {
            $target->logros()->detach();
            foreach ($target->sesionUsuario as $sesion) {

                // Recorrer datosSesion de cada sesión
                foreach ($sesion->datosSesion as $dato) {

                    // Detach de niveles
                    $dato->niveles()->detach();

                    // Eliminar registro de datosSesion
                    $dato->delete();
                }

                // Eliminar registro de sesionUsuario
                $sesion->delete();
            }
            $target->delete();
            return back()->with('success', 'Usuario eliminado correctamente.');
        }

        return back()->with('error', 'No tienes permiso para eliminar a este usuario.');
    }

    public function crearSesionUsuario($id_usuario){
        $sesion = new SesionUsuario();
        $sesion->id_usuario = $id_usuario;
        $sesion->fechaSesion = now();
        $sesion->save();
    }
}
