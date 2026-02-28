<?php

use App\Enums\RiskRating;
use App\Enums\TreeLifecycleStage;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fruit_crop_id')->constrained('fruit_crops')->onDelete('cascade');
            $table->string('tree_identifier');
            $table->integer('price_cents');
            $table->decimal('expected_roi_percent', 5, 2);
            $table->integer('age_years')->default(0);
            $table->integer('productive_lifespan_years');
            $table->enum('risk_rating', array_column(RiskRating::cases(), 'value'));
            $table->integer('min_investment_cents');
            $table->integer('max_investment_cents');
            $table->enum('status', array_column(TreeLifecycleStage::cases(), 'value'))->default(TreeLifecycleStage::SEEDLING->value);
            $table->json('historical_yield_json')->nullable();
            $table->json('pricing_config_json')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['fruit_crop_id', 'tree_identifier']);
            $table->index(['fruit_crop_id', 'status']);
            $table->index(['status', 'price_cents']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trees');
    }
};
