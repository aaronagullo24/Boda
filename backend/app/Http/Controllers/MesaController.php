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
}