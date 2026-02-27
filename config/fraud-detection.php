<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Fraud Detection Enabled
    |--------------------------------------------------------------------------
    */
    'enabled' => env('FRAUD_DETECTION_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Fraud Detection Thresholds
    |--------------------------------------------------------------------------
    */
    'thresholds' => [
        'rapid_investments' => [
            'count' => 3,
            'minutes' => 1,
        ],
        'unusual_amount' => [
            'multiplier' => 2.0, // 200% of average
            'min_transactions' => 5, // minimum history required
        ],
        'failed_auth' => [
            'count' => 5,
            'minutes' => 10,
        ],
    ],

];
