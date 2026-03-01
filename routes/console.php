<?php

use App\Jobs\CheckKycExpiry;
use App\Jobs\FetchWeatherData;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new CheckKycExpiry)->daily();

Schedule::job(new FetchWeatherData())->everySixHours();
