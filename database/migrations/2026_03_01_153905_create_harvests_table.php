<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('harvests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tree_id')->constrained('trees')->onDelete('cascade');
            $table->foreignId('fruit_crop_id')->constrained('fruit_crops')->onDelete('cascade');
            $table->date('scheduled_date');
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'failed'])->default('scheduled');
            $table->decimal('estimated_yield_kg', 10, 2)->nullable();
            $table->decimal('actual_yield_kg', 10, 2)->nullable();
            $table->enum('quality_grade', ['A', 'B', 'C'])->nullable();
            $table->foreignId('market_price_id')->nullable();
            $table->decimal('platform_fee_rate', 5, 4);
            $table->text('notes')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->json('reminders_sent')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tree_id', 'status']);
            $table->index(['fruit_crop_id', 'status']);
            $table->index('scheduled_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('harvests');
    }
};
