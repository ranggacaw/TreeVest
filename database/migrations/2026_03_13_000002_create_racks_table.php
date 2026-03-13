<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('racks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained('warehouses')->onDelete('cascade');
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('warehouse_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('racks');
    }
};
