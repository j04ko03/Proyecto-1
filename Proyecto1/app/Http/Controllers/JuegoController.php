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
    {
        $isReturningPLayer = 0;
        //Obtener
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
        $datosSesion->returningPlayer = $isReturningPLayer;

        //Se controla cuantas Datos sesion tiene el usuario
        $usuarioDS = Usuario::with('sesionUsuario.datosSesion')->find($usuarioId);
        $conteo = 0;
        foreach ($usuarioDS->sesionUsuario as $sesion) {
            $conteo += $sesion->datosSesion->count();
        }

        if($conteo > 2){
            $datosSesion->returningPlayer = 1;
        }

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

    /**
     * Inicia una partida para Volamentes (equivalente a iniciarJuegoAstro pero específico)
     * Recibe JSON con: usuarioId, juegoId
     * Devuelve: datosSesionId y nivel (objeto nivel o null)
     */
    public function iniciarJuegoVolamentes(Request $request)
    {
        $isReturningPLayer = 0;
        $usuarioId = $request->input('usuarioId');
        $juegoId   = $request->input('juegoId');

        \Log::info("Iniciar juego Volamentes: usuarioId={$usuarioId}, juegoId={$juegoId}");

        // Obtener la sesión activa más reciente del usuario
        $sesionActiva = \App\Models\SesionUsuario::where('id_usuario', $usuarioId)
            ->orderBy('fechaSesion', 'desc')
            ->first();

        if (!$sesionActiva) {
            return response()->json([
                'error' => 'El usuario no tiene una sesión activa registrada.'
            ], 400);
        }

        // Borrar DatosSesion incompletos (misma lógica usada en Astro)
        $this->borrarDatosSesionIncompletos($usuarioId);

        // Crear nuevo registro en DatosSesion
        $datosSesion = new DatosSesion();
        $datosSesion->id_SesionUsuario = $sesionActiva->id;
        $datosSesion->startTime = now();
        $datosSesion->returningPlayer = $isReturningPLayer;

        // Contar cuántas sesiones previas para marcar returningPlayer si procede
        $usuarioDS = Usuario::with('sesionUsuario.datosSesion')->find($usuarioId);
        $conteo = 0;
        foreach ($usuarioDS->sesionUsuario as $sesion) {
            $conteo += $sesion->datosSesion->count();
        }

        if ($conteo > 2) {
            $datosSesion->returningPlayer = 1;
        }

        $datosSesion->save();

        // Determinar el nivel que le corresponde al usuario para este juego
        $nivelActual = $this->obtenerNivelDelUsuario($usuarioId, $juegoId);

        if ($nivelActual) {
            $datosSesion->niveles()->attach($nivelActual->id);
        } else {
            \Log::warning("No hay niveles disponibles para usuario {$usuarioId} en Volamentes");
        }

        return response()->json([
            'datosSesionId' => $datosSesion->id,
            'nivel' => $nivelActual
        ]);
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
                //'returningPlayer'=> $request->returningPlayer,
            ]);

        return ['status' => 'ok'];
    }

    /**
     * Guarda los resultados enviados desde el juego Volamentes.
     *
     * Payload esperado (JSON):
     * - datosSesionId (int) : id de la fila en DatosSesion asociada a esta partida (recomendado)
     * - usuarioId (int) : id del usuario (opcional, pero útil para auditoría)
     * - juegoId (int) : id del juego (opcional)
     * - nivelId (int) : id del nivel jugado (opcional)
     * - score (int) : puntuación total o del nivel
     * - numeroIntentos (int) : número de intentos en el nivel (opcional)
     * - errores (int) : cantidad de errores cometidos (opcional)
     * - puntuacion (int) : (alias/otra métrica) (opcional)
     * - helpclicks (int) : ayudas usadas (opcional)
     *
     * Este método actualiza la fila en `datos_sesion` con los valores enviados y
     * asocia el `nivelId` (si se proporciona) usando la relación many-to-many `niveles()`.
     */
    public function guardarVolamentes(Request $request)
    {
        // registro para depuración
        \Log::info('guardarVolamentes payload', $request->all());

        $datosSesionId = $request->input('datosSesionId');

        // Si no envían `datosSesionId` devolvemos error porque es la forma más segura
        if (!$datosSesionId) {
            return response()->json([ 'error' => 'datosSesionId requerido' ], 400);
        }

        $datosSesion = DatosSesion::find($datosSesionId);

        if (!$datosSesion) {
            return response()->json([ 'error' => 'DatosSesion no encontrado' ], 404);
        }

        // Actualizamos campos permitidos
        $update = [];
        if ($request->has('score')) $update['score'] = $request->input('score');
        if ($request->has('numeroIntentos')) $update['numeroIntentos'] = $request->input('numeroIntentos');
        if ($request->has('errores')) $update['errores'] = $request->input('errores');
        if ($request->has('puntuacion')) $update['puntuacion'] = $request->input('puntuacion');
        if ($request->has('helpclicks')) $update['helpclicks'] = $request->input('helpclicks');

        // Siempre marcamos endTime cuando guardamos el resultado final del nivel
        $update['endTime'] = now();

        if (!empty($update)) {
            $datosSesion->update($update);
        }

        // Si nos pasaron un nivelId lo asociamos en la tabla pivot
        if ($request->has('nivelId')) {
            $nivelId = $request->input('nivelId');
            try {
                // evitar duplicados
                $datosSesion->niveles()->syncWithoutDetaching([$nivelId]);
            } catch (\Exception $e) {
                \Log::warning('No se pudo attach nivel a datosSesion: ' . $e->getMessage());
            }
        }

        return response()->json([ 'status' => 'ok', 'datosSesionId' => $datosSesion->id ]);
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
