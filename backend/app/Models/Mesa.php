<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'capacidad'];

    public function guests()
    {
        return $this->hasMany(Guest::class);
    }
}