<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestController;

Route::get('/guests', [GuestController::class, 'index'])->name('guests.index');
Route::post('/guests', [GuestController::class, 'store'])->name('guests.store');
