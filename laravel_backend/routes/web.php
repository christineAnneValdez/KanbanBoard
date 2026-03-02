<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

$frontendUrl = rtrim(env('FRONTEND_URL', 'http://127.0.0.1:3000'), '/');

Route::redirect('/', '/admin');

Route::get('/login', function () use ($frontendUrl) {
    return redirect()->away($frontendUrl . '/login');
})->name('login');

Route::get('/register', function () use ($frontendUrl) {
    return redirect()->away($frontendUrl . '/register');
})->name('register');

// Fallback API-style auth endpoints (for frontend configs that accidentally call /login or /register).
Route::middleware('api')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])
        ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class]);
    Route::post('/register', [AuthController::class, 'register'])
        ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class]);
});
