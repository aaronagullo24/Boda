<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use Illuminate\Http\Request;

class EventoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $eventos = Evento::orderBy('hora')->get();
        return response()->json($eventos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'hora' => 'required|date_format:H:i',
            'evento' => 'required|string|max:255',
        ]);

        $evento = Evento::create($validated);

        return response()->json($evento, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Evento $evento)
    {
        return response()->json($evento);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Evento $evento)
    {
        $validated = $request->validate([
            'hora' => 'sometimes|required|date_format:H:i',
            'evento' => 'sometimes|required|string|max:255',
        ]);

        $evento->update($validated);

        return response()->json($evento);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Evento $evento)
    {
        $evento->delete();
        return response()->json(null, 204);
    }
}
