<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\MesaController;

Route::get('/guests', [GuestController::class, 'index']);
Route::apiResource('mesas', MesaController::class);