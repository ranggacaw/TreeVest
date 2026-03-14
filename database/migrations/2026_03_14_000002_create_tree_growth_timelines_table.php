<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tree_growth_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tree_id')->constrained('trees')->onDelete('cascade');
            $table->foreignId('lot_id')->constrained('lots')->onDelete('cascade');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->enum('milestone_type', [
                'planting',
                'pruning',
                'fertilizing',
                'flowering',
                'fruiting',
                'pre_harvest',
                'harvest',
                'post_harvest',
                'health_check',
                'maintenance',
                'other'
            ])->default('other');
            $table->json('photos')->nullable(); // Array of photo paths
            $table->decimal('tree_height_cm', 8, 2)->nullable();
            $table->decimal('trunk_diameter_cm', 8, 2)->nullable();
            $table->integer('estimated_fruit_count')->nullable();
            $table->enum('health_status', ['excellent', 'good', 'fair', 'poor', 'critical'])->nullable();
            $table->text('notes')->nullable();
            $table->date('recorded_date');
            $table->boolean('is_visible_to_investors')->default(true);
            $table->timestamps();

            $table->index('tree_id');
            $table->index('lot_id');
            $table->index('recorded_date');
            $table->index(['tree_id', 'recorded_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tree_growth_timelines');
    }
};
