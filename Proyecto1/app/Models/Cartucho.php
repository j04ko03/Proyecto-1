<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cartucho extends Model
{

    protected $table = 'Juego';


    protected $primaryKey = 'id';

    // CREADO POR SI IMPLEMENTAMOS BOTÓN DE AÑADIR JUEGOS 

    // protected $fillable = [
    //     'nombre',
    //     'descripcion',
    //     'imagen',
    //     'niveles',
    //     'tipo'
    // ];

    // protected $casts = [
    //     'normas' => 'array',     // Si los guardamos como JSON los datos
    //     'controles' => 'array',  // Si los guardamos como JSON los datos  
    //     'isBLock' => 'true'
    // ];
}