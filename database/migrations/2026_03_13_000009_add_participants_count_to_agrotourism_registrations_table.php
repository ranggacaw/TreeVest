<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agrotourism_registrations', function (Blueprint $table) {
            $table->unsignedTinyInteger('participants_count')->default(1)->after('registration_type');
            $table->timestamp('rejected_at')->nullable()->after('cancelled_at');
            $table->text('rejection_reason')->nullable()->after('rejected_at');
        });
    }

    public function down(): void
    {
        Schema::table('agrotourism_registrations', function (Blueprint $table) {
            $table->dropColumn(['participants_count', 'rejected_at', 'rejection_reason']);
        });
    }
};
