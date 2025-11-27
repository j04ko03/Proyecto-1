<?php

namespace App\Models;

use App\Models\Nivel;
use App\Models\SesionUsuario;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class DatosSesion extends Model
{
    //
    protected $table = 'DatosSesion'; 

    // Desactiva timestamps si tu tabla no tiene created_at y updated_at
    public $timestamps = false;
    protected $primaryKey = 'id';

    /**
     * The niveles that belong to the DatosSesion
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function niveles(): BelongsToMany
    {
        return $this->belongsToMany(Nivel::class, 'DatosSesion_Nivel', 'id_datosSesion', 'id_nivel');
    }

    /**
     * Get the sesionUsuario that owns the DatosSesion
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function sesionUsuario(): BelongsTo
    {
        return $this->belongsTo(SesionUsuario::class, 'id_SesionUsuario');
    }
}
