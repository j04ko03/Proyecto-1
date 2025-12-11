<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MetricasController extends Controller
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
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    // Retorna JSON amb una fila per cada DatosSesion (amb camps necessaris)
    public function exportDatosSesionJson(Request $request)    {
        $rows = DB::table('DatosSesion as d')
            ->join('SesionUsuario as s', 'd.id_SesionUsuario', '=', 's.id')
            ->join('Usuario as u', 's.id_usuario', '=', 'u.id')
            ->select(
                'u.id as user_id',
                'u.nombre as username',
                's.id as session_id',
                's.fechaSesion as session_date',
                'd.startTime',
                'd.endTime',
                DB::raw("TIMESTAMPDIFF(SECOND, d.startTime, d.endTime) as session_length"),
                'd.score as points_scored',
                'd.numeroIntentos as n_attempts',
                'd.errores as errors',
                'd.helpclicks as help_clicks',
                'd.returningPlayer'
            )
            ->orderBy('u.id')
            ->get();

        return response()->json($rows);
    }

    public function exportDatosSesionCsv(Request $request){

        $rows = DB::table('DatosSesion as d')
            ->join('SesionUsuario as s', 'd.id_SesionUsuario', '=', 's.id')
            ->join('Usuario as u', 's.id_usuario', '=', 'u.id')
            ->select(
                'u.id as user_id',
                'u.nombre as username',
                's.id as session_id',
                's.fechaSesion as session_date',
                'd.startTime',
                'd.endTime',
                DB::raw("TIMESTAMPDIFF(SECOND, d.startTime, d.endTime) as session_length"),
                'd.score as points_scored',
                'd.numeroIntentos as n_attempts',
                'd.errores as errors',
                'd.helpclicks as help_clicks',
                'd.returningPlayer'
            )
            ->orderBy('u.id')
            ->get();

        $response = new StreamedResponse(function() use ($rows) {
            $handle = fopen('php://output', 'w');
            // header row
            fputcsv($handle, array_keys((array)$rows->first()));
            foreach ($rows as $row) {
                fputcsv($handle, (array)$row);
            }
            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="datos_sesion.csv"');

        return $response;
    }    

    public function runML()
    {
        $output = shell_exec("python3 Proyecto-1/Proyecto1/public/js/script_ml.py 2>&1");

        return response()->json([
            'result' => $output
        ]);
    }
}
