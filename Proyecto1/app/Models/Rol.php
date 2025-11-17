<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Usuario;

class Rol extends Model
{
    //
    protected $table='Roles';
    public $timestamps = false;

    /**
     * Get the usuarios that owns the Rol
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(Usuario::class, 'id_rol', 'id');
    }
}
