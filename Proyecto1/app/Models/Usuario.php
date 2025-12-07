<?php

namespace App\Models;
use App\Models\Rol;
use App\Models\Logro;
use App\Models\SesionUsuario;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
        'email',
        'password',
        'id_rol',
    ];

    // Valores por defecto
    /*protected $attributes = [
        'id_rol' => 2
    ];*/

    /**
     * Get all of the rol for the Usuario
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'id_rol', 'id');
    }

    /**
     * The logros that belong to the Usuario
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function logros(): BelongsToMany
    {
        return $this->belongsToMany(Logro::class, 'Usuario_Logro', 'id_usuario', 'id_logro');
    }

    /**
     * Get all of the sesionUsuario for the Usuario
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function sesionUsuario(): HasMany
    {
        return $this->hasMany(SesionUsuario::class, 'id_usuario');
    }

    public function maxScoreByGame($juegoId)
    {
        return $this->datosSesion()
            ->join('DatosSesion_Nivel', 'DatosSesion.id', '=', 'DatosSesion_Nivel.id_datosSesion')
            ->join('Nivel', 'DatosSesion_Nivel.id_nivel', '=', 'Nivel.id')
            ->join('Juego', 'Nivel.id_juego', '=', 'Juego.id')
            ->where('Juego.id', $juegoId)
            ->max('DatosSesion.score');
    }

    public function datosSesion()
    {
        return $this->hasManyThrough(
            DatosSesion::class,
            SesionUsuario::class,
            'id_usuario',        // SesionUsuario.id_usuario
            'id_SesionUsuario',  // DatosSesion.id_SesionUsuario
            'id',                // Usuario.id
            'id'                 // SesionUsuario.id
        );
    }
}
