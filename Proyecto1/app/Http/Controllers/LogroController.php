<?php

namespace App\Http\Controllers;

use App\Models\Logro;
use Illuminate\Http\Request;

class LogroController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        //
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

    public function desbloquear(Request $request){
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

        return response()->json([
            'nuevo' => true,
            'message' => 'Logro desbloqueado'
        ]);
    }
}
