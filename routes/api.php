<?php

use App\Http\Controllers\Api\ErrorReportController;
use App\Http\Controllers\PaymentIntentController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::post('/payment-intents', [PaymentIntentController::class, 'create']);
    
    // Error reporting endpoints
    Route::post('/error/report', [ErrorReportController::class, 'reportClientError'])->name('api.error.report');
});

// Public endpoints (no auth required)
Route::get('/error/config', [ErrorReportController::class, 'getConfig'])->name('api.error.config');
