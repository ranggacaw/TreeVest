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

Schedule::job(new FetchWeatherData)->everySixHours();

Schedule::command('app:send-harvest-reminders')->daily();

Schedule::command('app:purge-expired-reports')->dailyAt('02:00');

Schedule::command('listings:expire')->dailyAt('03:00');

Schedule::command('app:recalculate-lot-prices')->dailyAt('00:01');
