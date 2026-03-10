<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fruit_crops', function (Blueprint $table) {
            $table->unsignedInteger('total_trees')->default(0)->after('planted_date');
            $table->unsignedInteger('productive_trees')->default(0)->after('total_trees');
        });
    }

    public function down(): void
    {
        Schema::table('fruit_crops', function (Blueprint $table) {
            $table->dropColumn(['total_trees', 'productive_trees']);
        });
    }
};
