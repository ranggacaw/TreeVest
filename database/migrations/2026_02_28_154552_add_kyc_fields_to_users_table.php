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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('kyc_status', ['pending', 'submitted', 'verified', 'rejected'])->nullable()->after('role');
            $table->timestamp('kyc_verified_at')->nullable()->after('kyc_status');
            $table->timestamp('kyc_expires_at')->nullable()->after('kyc_verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['kyc_status', 'kyc_verified_at', 'kyc_expires_at']);
        });
    }
};
