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

    public function update(Request $request, Guest $guest) // Laravel inyecta el modelo Guest directamente
    {
        // Validar dinámicamente según los campos que lleguen en la petición
        $rules = [];
        if ($request->has('mesa_id') || $request->has('seat_position')) {
            $rules['mesa_id'] = 'nullable|integer|exists:mesas,id'; // Permite asignar a null
            $rules['seat_position'] = 'nullable|integer';
        }
        if ($request->has('confirmado')) {
            $rules['confirmado'] = 'required|boolean';
        }
        if ($request->has('nombre')) {
            $rules['nombre'] = 'required|string|max:255';
        }
        if ($request->has('apellido')) {
            $rules['apellido'] = 'nullable|string|max:255';
        }
        if ($request->has('familiaridad')) {
            $rules['familiaridad'] = 'required|string|max:255';
        }

        $validatedData = $request->validate($rules);

        // Validación de capacidad de la mesa
        if (isset($validatedData['mesa_id']) && $validatedData['mesa_id'] !== null && $validatedData['mesa_id'] != $guest->mesa_id) {
            $mesa = \App\Models\Mesa::findOrFail($validatedData['mesa_id']);
            if ($mesa->guests()->count() >= $mesa->capacidad) {
                return response()->json(['message' => 'La mesa está llena.'], 422);
            }
        }

        $guest->update($validatedData);

        $guest->save();

        return response()->json($guest->load('mesa'));
    }

    public function destroy(Guest $guest)
    {
        $guest->delete();
        return response()->json(null, 204);
    }
}
