<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weather_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->onDelete('cascade');
            $table->decimal('temperature_celsius', 5, 2);
            $table->unsignedInteger('humidity_percent');
            $table->decimal('wind_speed_kmh', 6, 2);
            $table->decimal('rainfall_mm_24h', 6, 2)->default(0);
            $table->string('weather_condition');
            $table->boolean('alert_triggered')->default(false);
            $table->timestamp('fetched_at');
            $table->timestamp('created_at')->index();

            $table->index(['farm_id', 'fetched_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weather_data');
    }
};
