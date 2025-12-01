<?php

namespace App\Models;

use App\Models\Logro;
use App\Models\Nivel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Juego extends Model
{
    //
    protected $table = 'Juego'; 

    // Desactiva timestamps si tu tabla no tiene created_at y updated_at
    public $timestamps = false;
    protected $primaryKey = 'id';

    /**
     * Get all of the logros for the Juego
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function logros(): HasMany
    {
        return $this->hasMany(Logro::class, 'juego_id');
    }
    
    /**
     * Get all of the niveles for the Juego
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function niveles(): HasMany
    {
        return $this->hasMany(Nivel::class, 'id_juego');
    }
}
