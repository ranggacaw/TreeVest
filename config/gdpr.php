<?php

return [

    /*
    |--------------------------------------------------------------------------
    | GDPR Compliance Settings
    |--------------------------------------------------------------------------
    */
    'retention' => [
        'audit_logs' => 2555, // 7 years in days
        'transactions' => 2555, // 7 years in days
        'inactive_accounts' => 730, // 2 years in days
    ],

    'export' => [
        'include_audit_logs' => false, // default exclude for user downloads?
        'include_transactions' => true,
    ],

    'deletion' => [
        'soft_delete_users' => true,
        'anonymize_transactions' => true,
    ],

];
