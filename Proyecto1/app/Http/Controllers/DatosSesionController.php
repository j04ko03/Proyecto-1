<?php

namespace App\Http\Controllers;

use App\Models\DatosSesion;
use App\Models\Usuario;
use Illuminate\Http\Request;
use function PHPUnit\Framework\isNull;
use Illuminate\Database\QueryException;
use App\Clases\Utilitat;

class DatosSesionController extends Controller
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
    public function show(DatosSesion $datosSesion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DatosSesion $datosSesion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DatosSesion $datosSesion)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    /**
     * Undocumented function
     *
     * @param DatosSesion $datosSesion
     * @return void
     */
    public function destroy(DatosSesion $datosSesion)
    {
        //
        try{
            $datosSesion->delete();
            session()->flash('success', 'Se borra correctamente los datos de sesión' . ' - ' . $datosSesion.id);
            $response = response()->json(['message' => 'Registros vacíos eliminados correctamente.']);
        }catch(QueryException $e){
            $missatge = Utilitat::errorMessage($e);
            session()->flash('error', 'No se puede borrar el registro' . ' - ' . $missatge);
            $response = redirect()->back();
        }

        return $response;
    }
}
