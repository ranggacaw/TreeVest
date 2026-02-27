<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

Route::controller(\App\Http\Controllers\LegalDocumentController::class)->group(function () {
    Route::get('/legal/privacy', 'privacyPolicy')->name('legal.privacy');
    Route::get('/legal/terms', 'termsOfService')->name('legal.terms');
    Route::get('/legal/risk', 'riskDisclosure')->name('legal.risk');
    Route::post('/legal/accept/{type}', 'accept')
        ->middleware(['auth', 'throttle:6,1'])
        ->name('legal.accept');
});

Route::middleware('auth')->group(function () {
    Route::post('/account/data-export', [\App\Http\Controllers\GdprController::class, 'export'])->name('account.export');
    Route::post('/account/delete', [\App\Http\Controllers\GdprController::class, 'destroy'])->name('account.delete');
});
