<?php

use App\Enums\HarvestCycle;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fruit_crops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained('farms')->onDelete('cascade');
            $table->foreignId('fruit_type_id')->constrained('fruit_types')->onDelete('cascade');
            $table->string('variant');
            $table->text('description')->nullable();
            $table->enum('harvest_cycle', array_column(HarvestCycle::cases(), 'value'));
            $table->date('planted_date')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['farm_id', 'fruit_type_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fruit_crops');
    }
};
