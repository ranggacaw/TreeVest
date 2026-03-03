<?php

use App\Http\Controllers\Api\ErrorReportController;
use App\Http\Controllers\PaymentIntentController;
use Illuminate\Support\Facades\Route;

// Financial API routes with CSRF protection for security
Route::middleware(['auth', 'web'])->group(function () {
    // Payment operations require CSRF protection due to financial nature
    Route::post('/payment-intents', [PaymentIntentController::class, 'create'])
        ->middleware('throttle:financial-throttle')
        ->name('api.payment-intents.create');
});

// Non-financial authenticated API routes (CSRF-exempt for API usability)
Route::middleware('auth')->group(function () {
    // Error reporting endpoints - not financial, can be CSRF-exempt
    Route::post('/error/report', [ErrorReportController::class, 'reportClientError'])
        ->name('api.error.report');
});

// Public endpoints (no auth required)
Route::get('/error/config', [ErrorReportController::class, 'getConfig'])
    ->name('api.error.config');
