<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\MesaController;

Route::get('/guests', [GuestController::class, 'index']);
Route::post('/guests', [GuestController::class, 'store']);
Route::delete('/guests/{guest}', [GuestController::class, 'destroy']);
Route::patch('/guests/{guest}', [GuestController::class, 'update']);
Route::put('/guests/{guest}', [GuestController::class, 'update']);
Route::apiResource('mesas', MesaController::class);