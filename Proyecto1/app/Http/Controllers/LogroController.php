<?php

namespace App\Http\Controllers;

use App\Models\Logro;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use App\Clases\Utilitat;

class LogroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Muestra un listado de logros disponibles y los logros obtenidos por el usuario autenticado.
     *
     * Carga todos los logros con su relación a juegos y determina cuáles
     * ya tiene el usuario.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response|\Illuminate\View\View
     */
    public function index(Request $request)
    {
        //
        try{
            $usuario = auth()->user();

            $logros = Logro::with('juego')->get();

            $logrosUsuario = $usuario->logros->pluck('id')->toArray();

            $response = view('logros', compact('logros', 'logrosUsuario'));
            session()->flash('success', 'Logros extraídos');
        }catch(QueryException $e){
            $missatge = Utilitat::errorMessage($e);
            session()->flash('error', 'No se ha podido inicializar Logros' . ' - ' . $missatge);
            $response = redirect()->back();
        }
        return $response;
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Logro $logro)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Logro $logro)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Logro $logro)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Logro $logro)
    {
        //
    }

    /**
     * Desbloquea un logro para el usuario autenticado.
     *
     * Verifica si el usuario ya tiene el logro. Si no lo tiene,
     * lo asocia al usuario y devuelve un JSON indicando que es nuevo.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function desbloquear(Request $request){
        try{   
            $usuario = auth()->user();
            $logroId   = $request->logroId;

            // Mira si el usuuario ya tiene el logro
            if ($usuario->logros()->where('Usuario_Logro.id_logro', $logroId)->exists()) {
                return response()->json([
                    'nuevo' => false,
                    'message' => 'Logro ya obtenido'
                ]);
            }

            // Guardar el logro
            $usuario->logros()->attach($logroId);

            $response = response()->json([
                'nuevo' => true,
                'message' => 'Logro desbloqueado'
            ]);
            session()->flash('success', 'Logro desbloqueado');
        }catch(QueryException $e){
            $missatge = Utilitat::errorMessage($e);
            session()->flash('error', 'No se ha podido desbloquear Logro' . ' - ' . $missatge);
            $response = redirect()->back();
        }
        return $response;
    }
}
