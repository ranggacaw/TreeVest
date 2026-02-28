<?php

return [
    'phone_auth' => env('ENABLE_PHONE_AUTH', false),
    'oauth_auth' => env('ENABLE_OAUTH_AUTH', false),
    '2fa' => env('ENABLE_2FA', false),
];
