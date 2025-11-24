<?php

namespace App\Http\Controllers;

use App\Models\Juegos;
use App\Http\Requests\StoreJuegosRequest;
use App\Http\Requests\UpdateJuegosRequest;

class JuegosController extends Controller
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
    public function store(StoreJuegosRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Juegos $juegos)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Juegos $juegos)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateJuegosRequest $request, Juegos $juegos)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Juegos $juegos)
    {
        //
    }
}
