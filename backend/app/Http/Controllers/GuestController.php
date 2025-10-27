<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function index()
    {
        // Obtener todos los invitados con el campo 'familiaridad'
        $guests = Guest::all();

        return response()->json($guests);
    }

    public function update(Request $request, Guest $guest)
    {
        // Validar los datos de entrada
        $validatedData = $request->validate([
            'mesa_id' => 'nullable|integer|exists:mesas,id',
            'seat_position' => 'nullable|integer',
        ]);

        // Actualizar el invitado
        // El método fill es más seguro que asignar directamente
        $guest->fill($validatedData);

        // Si mesa_id es null, también seat_position debe ser null
        if (array_key_exists('mesa_id', $validatedData) && is_null($validatedData['mesa_id'])) {
            $guest->seat_position = null;
        }

        $guest->save();

        // Devolver el invitado actualizado
        return response()->json($guest);
    }
}
