<?php

namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Rol;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Authenticatable
{
    //
    use HasFactory, Notifiable;

    protected $table = 'Usuario';
    protected $primaryKey = 'id'; 
    protected $autoIncrement = true;
    protected $keyType = 'int';
    public $timestamps = false;

    // Masificacion de campos asignables
    protected $fillable = [
        'nombre',
        'apellido1',
        'apellido2',
        'nickName', 
        'correo',
        'password',
    ];

    // Valores por defecto
    protected $attributes = [
        'id_rol' => 2
    ];

    /**
     * Get all of the rol for the Usuario
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id');
    }
}
