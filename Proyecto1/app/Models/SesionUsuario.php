<?php

namespace App\Models;

use App\Models\Usuario;
use App\Models\DatosSesion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SesionUsuario extends Model
{
    // 
    protected $table = 'SesionUsuario'; 
 
    // Desactiva timestamps si tu tabla no tiene created_at y updated_at
    public $timestamps = false;
    protected $primaryKey = 'id';   

    /**
     * Get the usuario that owns the SesionUsuario
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    /**
     * Get all of the datosSesion for the SesionUsuario
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function datosSesion(): HasMany
    {
        return $this->hasMany(DatosSesion::class, 'id_SesionUsuario');
    }
}
