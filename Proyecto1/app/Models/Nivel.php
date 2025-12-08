<?php

namespace App\Models;

use App\Models\Juego;
use App\Models\DatosSesion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Nivel extends Model
{
    //
    protected $table = 'Nivel'; 

    // Desactiva timestamps si tu tabla no tiene created_at y updated_at
    public $timestamps = false;
    protected $primaryKey = 'id';

    /**
     * Get the juego that owns the Nivel
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function juego(): BelongsTo
    {
        return $this->belongsTo(Juego::class, 'id_juego');
    }

    /**
     * The datosSesion that belong to the Nivel
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function datosSesion(): BelongsToMany
    {
        return $this->belongsToMany(DatosSesion::class, 'DatosSesion_Nivel', 'id_nivel', 'id_datosSesion');
    }
}
