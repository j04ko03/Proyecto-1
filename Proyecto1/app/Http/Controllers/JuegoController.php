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
    }

    public function obtenerNivelDelUsuario($sesionUsuario, $juegoId)
    {
        $nivelDevuelto = null;

        // 1. Todas las sesiones del usuario
        $sesiones = $sesionUsuario->datosSesiones()->with('niveles')->get();

        // 2. Extraer los niveles jugados de este juego
        $dificultadesJugadas = [];

        foreach ($sesiones as $sesion) {
            foreach ($sesion->niveles as $nivel) {
                if ($nivel->id_juego == $juegoId) {
                    $dificultadesJugadas[] = $nivel->dificultad;
                }
            }
        }

        // 3. Niveles del juego ordenados por dificultad
        $niveles = Nivel::where('id_juego', $juegoId)
                        ->orderBy('dificultad')
                        ->get();

        // 4. Determinar el nivel a jugar
        if (empty($dificultadesJugadas)) {
            $nivelDevuelto = $niveles->first(); // Nunca jugó → primer nivel
        } else {
            $ultima = max($dificultadesJugadas);
            // Buscar el siguiente nivel disponible
            $nivelDevuelto = $niveles->firstWhere('dificultad', $ultima + 1);
            if (!$nivelDevuelto) {
                $nivelDevuelto = $niveles->last(); // Si ya jugó todos
            }
        }
            
        return $nivelDevuelto;
    }

    public function finalizarNivel(Request $request)
    {
        DatosSesion::where('id', $request->datosSesionId)
            ->update([
                'endTime'        => now(),
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
