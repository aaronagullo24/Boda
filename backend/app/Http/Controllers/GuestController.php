<?php
namespace App\Http\Controllers;

use App\Models\Guest;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    // Devuelve todos los invitados
    public function index()
    {
        return Guest::all();
    }

    // Crear un nuevo invitado
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'email' => 'required|email|unique:guests,email',
            'confirmado' => 'boolean',
            'mesa_id' => 'nullable|exists:mesas,id',
        ]);
        $guest = Guest::create($validated);
        return response()->json($guest, 201);
    }

    // Devuelve un invitado específico
    public function show(Guest $guest)
    {
        return $guest;
    }

    // Actualizar un invitado existente
    public function update(Request $request, Guest $guest)
    {
        $validated = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'apellido' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('guests')->ignore($guest->id),
            ],
            'confirmado' => 'sometimes|boolean',
            'mesa_id' => 'nullable|exists:mesas,id',
        ]);

        $guest->update($validated);

        return response()->json($guest);
    }

    // Eliminar un invitado
    public function destroy(Guest $guest)
    {
        $guest->delete();
        return response()->json(null, 204);
    }
}
