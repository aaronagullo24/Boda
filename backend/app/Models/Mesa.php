<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    // Una mesa tiene muchos invitados
    public function guests()
    {
        return $this->hasMany(Guest::class);
    }
}
