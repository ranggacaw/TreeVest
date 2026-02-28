<?php

use App\Http\Controllers\PaymentIntentController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::post('/payment-intents', [PaymentIntentController::class, 'create']);
});
