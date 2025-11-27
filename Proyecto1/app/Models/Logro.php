<?php

namespace App\Models;

use App\Models\Juego;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Logro extends Model
{
    //
    protected $table = 'Logro'; 

    // Desactiva timestamps si tu tabla no tiene created_at y updated_at
    public $timestamps = false;
    protected $primaryKey = 'id';
    /**
     * Get the juego that owns the Logro
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function juego(): BelongsTo
    {
        return $this->belongsTo(Juego::class, 'juego_id');
    }

    /**
     * The usuarios that belong to the Logro
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'Usuario_Logro', 'id_logro', 'id_usuario');
    }
}
