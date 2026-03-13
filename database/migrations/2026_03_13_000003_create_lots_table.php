<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rack_id')->constrained('racks')->onDelete('cascade');
            $table->foreignId('fruit_crop_id')->constrained('fruit_crops')->onDelete('cascade');
            $table->string('name', 100);
            $table->unsignedSmallInteger('total_trees');
            $table->unsignedBigInteger('base_price_per_tree_cents');
            $table->decimal('monthly_increase_rate', 5, 4)->default(0.0000);
            $table->unsignedBigInteger('current_price_per_tree_cents');
            $table->date('cycle_started_at')->nullable();
            $table->unsignedTinyInteger('cycle_months');
            $table->unsignedTinyInteger('last_investment_month');
            $table->string('status', 20)->default('active');
            // Harvest fields
            $table->unsignedInteger('harvest_total_fruit')->nullable();
            $table->decimal('harvest_total_weight_kg', 8, 2)->nullable();
            $table->text('harvest_notes')->nullable();
            $table->timestamp('harvest_recorded_at')->nullable();
            // Selling fields
            $table->unsignedBigInteger('selling_revenue_cents')->nullable();
            $table->string('selling_proof_photo')->nullable();
            $table->timestamp('selling_submitted_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('rack_id');
            $table->index('fruit_crop_id');
            $table->index('status');
            $table->index('cycle_started_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lots');
    }
};
