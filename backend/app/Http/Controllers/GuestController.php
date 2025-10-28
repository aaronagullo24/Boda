<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function index()
    {
        // Obtener todos los invitados con el campo 'familiaridad'
        $guests = Guest::with('mesa')->get();

        return response()->json($guests);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'nullable|string|max:255',
            'familiaridad' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:guests,email',
        ]);

        $guest = new Guest();
        $guest->nombre = $validated['nombre'];
        $guest->apellido = $validated['apellido'] ?? '';
        $guest->email = $validated['email'] ?? ('invitado_' . uniqid() . '@boda.local');
        $guest->confirmado = false;
        $guest->mesa_id = null;
        $guest->familiaridad = $validated['familiaridad'] ?? null;
        $guest->save();

        return response()->json($guest->fresh(), 201);
    }

    public function update(Request $request, Guest $guest)
    {
        $validatedData = $request->validate([
            'mesa_id' => 'nullable|integer|exists:mesas,id',
            'seat_position' => 'nullable|integer',
        ]);

        // Asignar mesa_id si está presente en la solicitud
        if (array_key_exists('mesa_id', $validatedData)) {
            $guest->mesa_id = $validatedData['mesa_id'];
        }

        // Si se asigna una mesa, se puede asignar un asiento.
        // Si no se asigna mesa (mesa_id es null), el asiento también debe ser null.
        if ($guest->mesa_id !== null) {
            if (array_key_exists('seat_position', $validatedData)) {
                $guest->seat_position = $validatedData['seat_position'];
            }
        } else {
            $guest->seat_position = null;
        }

        $guest->save();

        return response()->json($guest);
    }

    public function destroy(Guest $guest)
    {
        $guest->delete();
        return response()->json(null, 204);
    }
}
