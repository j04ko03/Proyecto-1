<?php

namespace App\Http\Controllers;

use App\Models\DatosSesion;
use App\Models\Juego;
use App\Models\Nivel;
use Illuminate\Http\Request;

class JuegoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
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
    public function show(Juego $juego)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Juego $juego)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Juego $juego)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Juego $juego)
    {
        //
    }

    public function iniciarJuegoAstro($usuarioId, $juegoId)
    {
        //Obtener Sesion activa del usuario
        $sesionActiva = \App\Models\SesionUsuario::where('id_usuario', $usuarioId)
            ->latest()
            ->first();

        //Crear datos de juego en DatosSesion con el id_usuari y el startTime
        $datosSesion = new DatosSesion();
        $datosSesion->id_SesionUsuario = $sesionActiva->id;
        $datosSesion->startTime = now();

        $datosSesion->save();
        
        //Obtener en que nivel está el usuario en el juego Astro
        $nivelActual = $this->obtenerNivelDelUsuario($sesionActiva, $juegoId);

        //Guardar el nivel actual en la sesion de juego
        $datosSesion->niveles()->attach($nivelActual->id);

        return ['datosSesionId' => $datosSesion->id,
        'nivel' => $nivelActual];
    }

    public function obtenerNivelDelUsuario($sesionUsuario, $juegoId)
    {
        // 1. Cargar todas las sesiones y datos del usuario
        $usuario = Usuario::with('sesionesUsuario.datosSesiones.niveles')
                        ->find($usuarioId);

        $nivelesJugados = [];

        // 2. Recorrer todas las sesiones -> todos los DatosSesion -> sus niveles
        foreach ($usuario->sesionesUsuario as $sesionUsuario) {

            foreach ($sesionUsuario->datosSesiones as $datosSesion) {

                // Solo sesiones finalizadas
                if ($datosSesion->endTime === null) continue;

                foreach ($datosSesion->niveles as $nivel) {

                    if ($nivel->id_juego == $juegoId) {
                        $nivelesJugados[] = $nivel->id;
                    }
                }
            }
        }

        $nivelesJugados = array_unique($nivelesJugados);

        // 3. Obtener todos los niveles del juego ordenados
        $niveles = Nivel::where('id_juego', $juegoId)
                        ->orderBy('dificultad')
                        ->get();

        // 4. Devolver el primer nivel NO jugado
        foreach ($niveles as $nivel) {
            if (!in_array($nivel->id, $nivelesJugados)) {
                return $nivel;
            }
        }

        // 5. Si jugó todos, devolver el último
        return $niveles->last();
    }

    public function finalizarNivel(Request $request)
    {
        DatosSesion::where('id', $request->datosSesionId)
            ->update([
                'endTime'        => now(),   // importante para marcar finalizado
                'score'          => $request->score,
                'numeroIntentos' => $request->numeroIntentos,
                'errores'        => $request->errores,
                'puntuacion'     => $request->puntuacion,
                'helpclicks'     => $request->helpclicks,
                'returningPlayer'=> $request->returningPlayer,
            ]);

        return ['status' => 'ok'];
    }
}
