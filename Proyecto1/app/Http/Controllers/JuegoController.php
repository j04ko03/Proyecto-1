<?php

namespace App\Http\Controllers;

use App\Models\DatosSesion;
use App\Models\Juego;
use App\Models\Nivel;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log; // ✅ Esto faltaba

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

    public function iniciarJuegoAstro(Request $request)
    {   //Obtener
        $usuarioId = $request->input('usuarioId');
        $juegoId   = $request->input('juegoId');
        \Log::info("Iniciar juego Astro: usuarioId={$usuarioId}, juegoId={$juegoId}");

        //Obtener Sesion activa del usuario
        $sesionActiva = \App\Models\SesionUsuario::where('id_usuario', $usuarioId)
            ->orderBy('fechaSesion', 'desc')
            ->first();

        \Log::info("Sesion activa:", ['sesion' => $sesionActiva]);

        if (!$sesionActiva) {
            return response()->json([
                'error' => 'El usuario no tiene una sesión activa registrada.'
            ], 400);
        }

        //En caso que el usuario haga refresh de la página, borraremos Los DatosSesion sin completar endtime y score
        $this->borrarDatosSesionIncompletos($usuarioId); //busca en el controlador todos los DatosSesion incompletos y los borra con el null y los foreach anidados

        //Crear datos de juego en DatosSesion con el id_usuari y el startTime
        $datosSesion = new DatosSesion();
        $datosSesion->id_SesionUsuario = $sesionActiva->id;
        $datosSesion->startTime = now();

        $datosSesion->save();
        
        //Obtener en que nivel está el usuario en el juego Astro
        $nivelActual = $this->obtenerNivelDelUsuario($usuarioId, $juegoId);
        \Log::info("Nivel actual:", ['nivel' => $nivelActual]);

        //Guardar el nivel actual en la sesion de juego
        if ($nivelActual) {
            $datosSesion->niveles()->attach($nivelActual->id);
        } else {
            \Log::warning("No hay niveles disponibles para usuario {$usuarioId}");
        }

        return ['datosSesionId' => $datosSesion->id,
        'nivel' => $nivelActual];
    }

    public function actualizaDatosSesionNivel(Request $request){
         $usuarioId = $request->input('usuarioId');

        \Log::info("Obteniendo última sesión Astro para usuario {$usuarioId}");
        // 1. Buscar la última sesión activa del usuario
        $sesionUsuario = \App\Models\SesionUsuario::where('id_usuario', $usuarioId)
            ->orderBy('fechaSesion', 'desc')
            ->first();

        if (!$sesionUsuario) {
            return response()->json([
                'error' => 'El usuario no tiene sesiones registradas.'
            ], 404);
        }

        // 2. Obtener la última DatosSesion asociada a esa sesión
        $ultimaDatosSesion = DatosSesion::where('id_SesionUsuario', $sesionUsuario->id)
            ->orderBy('startTime', 'desc')
            ->with('niveles') // cargar niveles asociados
            ->first();
        if (!$ultimaDatosSesion) {
            return response()->json([
                'error' => 'No existen DatosSesion previas para este usuario.'
            ], 404);
        }

        // 3. Obtener el nivel asociado (si existe)
        $nivel = $ultimaDatosSesion->niveles->first(); // normalmente hay uno

        return response()->json([
            'datosSesionId' => $ultimaDatosSesion->id,
            'nivel'         => $nivel ? $nivel->id : null
        ]);
    }

    public function obtenerNivelDelUsuario($usuarioId, $juegoId)
    {
        
        // Cargar relaciones usando los nombres EXACTOS de tus modelos
        $usuario = Usuario::with('sesionUsuario.datosSesion.niveles')
                        ->find($usuarioId);

        $nivelesJugados = [];

        // Asegurar que no rompa si no hay sesiones
        foreach ($usuario->sesionUsuario ?? [] as $sesionUsuario) {

            foreach ($sesionUsuario->datosSesion ?? [] as $datosSesion) {

                if ($datosSesion->endTime === null) continue;

                foreach ($datosSesion->niveles ?? [] as $nivel) {

                    if ($nivel->id_juego == $juegoId) {
                        $nivelesJugados[] = $nivel->id;
                    }
                }
            }
        }

        $nivelesJugados = array_unique($nivelesJugados);

        $niveles = Nivel::where('id_juego', $juegoId)
                        ->orderBy('dificultad')
                        ->get();

        foreach ($niveles as $nivel) {
            if (!in_array($nivel->id, $nivelesJugados)) {
                return $nivel;
            }
        }

        return $niveles->last();
    }

    public function borrarDatosSesionIncompletos($usuarioId)
    {
        $usuarioDatosSesion = Usuario::with('sesionUsuario.datosSesion')->find($usuarioId);

        foreach ($usuarioDatosSesion->sesionUsuario as $sesion) {
            foreach ($sesion->datosSesion as $dato) {
                if (is_null($dato->endTime) && is_null($dato->score)) {
                    $dato->niveles()->detach(); // Borra relaciones en la tabla pivot
                    $dato->delete();
                }
            }
        }
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

    public function  desbloquearJuego(Request $request)  {
        $juegoActualId = $request->input('juegoId');

        // Buscar el siguiente juego en orden
        $siguiente = Juego::where('id', '>', $juegoActualId)
            ->orderBy('id', 'asc')
            ->first();

        if (!$siguiente) {
            return response()->json([
                'status' => 'no-more-games',
                'message' => 'No hay más juegos después de este.'
            ]);
        }

        if ($siguiente->isBlocked == 0) {
            return response()->json([
                'status' => 'already-unlocked',
                'message' => 'El siguiente juego ya estaba desbloqueado.',
                'juego' => $siguiente->id
            ]);
        }

        // Desbloquear ese siguiente juego
        $siguiente->isBlocked = 0;
        $siguiente->save();

        return response()->json([
            'status' => 'ok',
            'message' => 'Juego desbloqueado correctamente.',
            'juegoDesbloqueado' => $siguiente->id
        ]);
        }
}
