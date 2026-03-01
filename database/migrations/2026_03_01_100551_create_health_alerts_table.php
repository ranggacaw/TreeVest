<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->onDelete('cascade');
            $table->foreignId('fruit_crop_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('alert_type', ['weather', 'pest', 'disease', 'manual']);
            $table->enum('severity', ['low', 'medium', 'high']);
            $table->string('title');
            $table->text('message');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('created_at')->index();
            $table->timestamp('updated_at');

            $table->index(['farm_id', 'created_at']);
            $table->index(['fruit_crop_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_alerts');
    }
};
