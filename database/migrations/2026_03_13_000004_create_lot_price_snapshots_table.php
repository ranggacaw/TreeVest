<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lot_price_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lot_id')->constrained('lots')->onDelete('cascade');
            $table->unsignedTinyInteger('cycle_month');
            $table->unsignedBigInteger('price_per_tree_cents');
            $table->timestamp('recorded_at');

            $table->index(['lot_id', 'cycle_month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lot_price_snapshots');
    }
};
