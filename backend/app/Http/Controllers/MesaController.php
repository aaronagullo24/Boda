<?php

namespace App\Http\Controllers;

use App\Models\Mesa;
use Illuminate\Http\Request;

class MesaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Cargar las mesas con sus invitados asociados
        $mesas = Mesa::with('guests')->get();
        return response()->json($mesas);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validación alineada con las restricciones de la base de datos
        $validatedData = $request->validate([
            'nombre' => 'required|string|max:255',
            'capacidad' => 'required|integer|min:1',
        ]);

        $mesa = Mesa::create($validatedData);

        // Devolver la mesa con la relación de invitados vacía para consistencia
        $mesa->load('guests');

        return response()->json($mesa, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Mesa $mesa)
    {
        $validatedData = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'capacidad' => 'sometimes|required|integer|min:1',
            'position_x' => 'nullable|integer',
            'position_y' => 'nullable|integer',
        ]);

        if (isset($validatedData['capacidad']) && $validatedData['capacidad'] < $mesa->capacidad) {
            $currentGuestsCount = $mesa->guests()->count();
            if ($validatedData['capacidad'] < $currentGuestsCount) {
                // Calcular cuántos sobran
                $excess = $currentGuestsCount - $validatedData['capacidad'];

                // Obtener los invitados que sobran (por ejemplo, los últimos añadidos o sin orden específico)
                // Aquí tomamos los últimos asignados para quitarlos
                $guestsToUnassign = $mesa->guests()->latest('updated_at')->take($excess)->get();

                foreach ($guestsToUnassign as $guest) {
                    $guest->mesa_id = null;
                    $guest->seat_position = null;
                    $guest->save();
                }
            }
        }

        $mesa->update($validatedData);

        return response()->json($mesa->load('guests'));
    }
}