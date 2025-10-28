<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    protected $fillable = [
        'nombre', 'apellido', 'email', 'confirmado', 'mesa_id', 'familiaridad', 'seat_position'
    ];

    public function mesa()
    {
        return $this->belongsTo(Mesa::class);
    }
}
