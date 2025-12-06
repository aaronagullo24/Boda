<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\MesaController;
use App\Http\Controllers\EventoController;
use App\Http\Controllers\GastoController;

Route::apiResource('guests', GuestController::class);
Route::apiResource('mesas', MesaController::class);
Route::apiResource('eventos', EventoController::class);
Route::apiResource('gastos', GastoController::class);