<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\SesionUsuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
use App\Clases\Utilitat;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Muestra un listado de usuarios según el rol del usuario autenticado.
     *
     * - Rol 1 (Admin): puede ver usuarios con rol 2 y 3.
     * - Rol 2 (Moderador): puede ver usuarios con rol 3.
     * - Rol 3 (Usuario): no tiene permisos, retorna colección vacía.
     *
     * @return \Illuminate\View\View|\Illuminate\Http\RedirectResponse
     */
    public function index()
    {
        try{
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

            $response = view('usuarios.index', compact('usuario'));
            session()->flash('success', 'Se ha iniciado Astro');
        }catch(QueryException $e){
            $missatge = Utilitat::errorMessage($e);
            session()->flash('error', 'No se ha podido inicializar Astro' . ' - ' . $missatge);
            $response = redirect()->back();
        }

        return $response;
    }

    /**
     * Show the form for creating a new resource.
     */
    /**
     * Muestra el formulario de registro de un nuevo usuario.
     *
     * @return \Illuminate\View\View
     */
    public function create()
    {
        //Enviamos a la vista del registro
        return view('auth.register');
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * Almacena un nuevo usuario en la base de datos.
     *
     * - Valida los datos del formulario.
     * - Determina el rol según admin_secret.
     * - Hashea la contraseña.
     * - Crea la sesión del usuario recién registrado.
     * - Inicia sesión automáticamente.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        try{
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

            $response = redirect()->route('home.controller')->with('success', '¡Cuenta creada exitosamente!');
        }catch(QueryException $e){
            $missatge = Utilitat::errorMessage($e);
            session()->flash('error', 'No se ha podido crear la cuenta' . ' - ' . $missatge);
            $response = redirect()->back();
        }

        return $response;
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
    /**
     * Elimina un usuario del sistema.
     *
     * - Solo permite eliminar usuarios con rol inferior al del usuario autenticado.
     * - No permite eliminarse a sí mismo.
     * - Desasocia logros y datos de sesiones antes de eliminar.
     *
     * @param  int  $id  ID del usuario a eliminar
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        try{
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
                $response = back()->with('success', 'Usuario eliminado correctamente.');
            }

            $response = back()->with('error', 'No tienes permiso para eliminar a este usuario.');
        }catch(QueryException $e){
            $missatge = Utilitat::errorMessage($e);
            session()->flash('error', 'Error al eliminar a este usuario.' . ' - ' . $missatge);
            $response = redirect()->back();
        }

        return $response;
    }

    /**
     * Crea una nueva sesión de usuario (SesionUsuario).
     *
     * Se llama al registrar o iniciar sesión un usuario.
     *
     * @param  int  $id_usuario  ID del usuario autenticado
     * @return void
     */
    public function crearSesionUsuario($id_usuario){
        try{
            $sesion = new SesionUsuario();
            $sesion->id_usuario = $id_usuario;
            $sesion->fechaSesion = now();
            $sesion->save();
            session()->flash('success', 'Se ha creado la sesión de usuario');
        }catch(QueryException $e){
            $missatge = Utilitat::errorMessage($e);
            session()->flash('error', 'No se ha podido crear la sesión de usuario' . ' - ' . $missatge);
        }
    }
}
