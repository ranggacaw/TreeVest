<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agrotourism_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained('farms')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->dateTime('event_date');
            $table->enum('event_type', ['online', 'offline', 'hybrid']);
            $table->unsignedInteger('max_capacity')->nullable();
            $table->text('location_notes')->nullable();
            $table->boolean('is_registration_open')->default(true);
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agrotourism_events');
    }
};
