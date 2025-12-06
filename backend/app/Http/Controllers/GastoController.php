<?php

namespace App\Http\Controllers;

use App\Models\Gasto;
use Illuminate\Http\Request;

class GastoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $gastos = Gasto::all();
        return response()->json($gastos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'total' => 'required|numeric|min:0',
            'pagado' => 'sometimes|boolean',
        ]);

        $gasto = Gasto::create($request->all());

        return response()->json($gasto, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Gasto $gasto)
    {
        return $gasto;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Gasto $gasto)
    {
        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'total' => 'sometimes|required|numeric|min:0',
            'pagado' => 'sometimes|boolean',
        ]);

        $gasto->update($request->all());

        return response()->json($gasto, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Gasto $gasto)
    {
        $gasto->delete();

        return response()->json(null, 204);
    }
}
