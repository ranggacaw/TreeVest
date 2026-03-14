<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trees', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('lot_id');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('qr_code', 100)->nullable()->unique()->after('tree_identifier');
            
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::table('trees', function (Blueprint $table) {
            $table->dropIndex(['latitude', 'longitude']);
            $table->dropColumn(['latitude', 'longitude', 'qr_code']);
        });
    }
};
