<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('investments', function (Blueprint $table) {
            $table->foreignId('lot_id')->nullable()->after('tree_id')->constrained('lots')->onDelete('set null');
            $table->unsignedTinyInteger('purchase_month')->nullable()->after('lot_id');
            $table->index('lot_id');
        });
    }

    public function down(): void
    {
        Schema::table('investments', function (Blueprint $table) {
            $table->dropForeign(['lot_id']);
            $table->dropColumn(['lot_id', 'purchase_month']);
        });
    }
};
