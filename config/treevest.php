<?php

return [
    'kyc' => [
        'provider' => env('KYC_PROVIDER', 'manual'),
        'default_jurisdiction' => env('KYC_DEFAULT_JURISDICTION', 'MY'),

        'jurisdictions' => [
            'MY' => [
                'required_documents' => ['passport', 'proof_of_address'],
                'optional_documents' => ['national_id', 'drivers_license'],
                'expiry_period_days' => 365,
            ],
        ],

        'max_file_size' => 10,
        'allowed_document_types' => [
            'image/jpeg',
            'image/png',
            'application/pdf',
        ],

        'expiry_period_days' => env('KYC_EXPIRY_PERIOD_DAYS', 365),
        'expiry_reminder_days' => [30, 14, 7],
    ],
];
