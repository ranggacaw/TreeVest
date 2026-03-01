<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tree_health_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fruit_crop_id')->constrained()->onDelete('cascade');
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->enum('update_type', ['routine', 'pest', 'disease', 'damage', 'weather_impact', 'other']);
            $table->string('title');
            $table->text('description');
            $table->json('photos')->nullable();
            $table->enum('visibility', ['public', 'investors_only'])->default('investors_only');
            $table->timestamp('created_at')->index();
            $table->timestamp('updated_at');

            $table->index(['fruit_crop_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tree_health_updates');
    }
};
