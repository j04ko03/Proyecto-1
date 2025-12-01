<?php

namespace App\Http\Controllers;

use App\Models\DatosSesion;
use App\Models\Usuario;
use Illuminate\Http\Request;
use function PHPUnit\Framework\isNull;

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
    public function destroy(DatosSesion $datosSesion)
    {
        //
        $datosSesion->delete();

        return response()->json(['message' => 'Registros vacíos eliminados correctamente.']);
    }
}
