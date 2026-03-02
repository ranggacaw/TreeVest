<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = \Illuminate\Http\Request::create('/secondary-market/create', 'GET');
$user = \App\Models\User::find(3);
if ($user) {
    if (!$user->kyc_verified_at) {
        $user->kyc_verified_at = now();
        $user->save();
        echo "Set KYC verified.\n";
    }
    dump($user->hasVerifiedKyc());
    $request->setUserResolver(function () use ($user) {
        return $user;
    });
}
$controller = new \App\Http\Controllers\SecondaryMarket\ListingController(app(\App\Services\SecondaryMarketService::class));
try {
    $response = $controller->create($request);
    echo "SUCCESS!\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
