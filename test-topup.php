<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = App\Models\User::where('role', 'investor')->first();
if (!$user) { echo "No investor user found\n"; exit; }
$investment = App\Models\Investment::where('user_id', $user->id)->first();
if (!$investment) { echo "No investment found\n"; exit; }

Auth::login($user);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::create('/investments/' . $investment->id . '/top-up', 'GET')
);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Content length: " . strlen($response->getContent()) . "\n";
if ($response->getStatusCode() != 200) {
    echo $response->getContent() . "\n";
}
