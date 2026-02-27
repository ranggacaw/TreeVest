<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->unique()->after('email');
            $table->string('phone_country_code', 2)->nullable()->after('phone');
            $table->timestamp('phone_verified_at')->nullable()->after('phone_country_code');
            $table->string('avatar_url')->nullable()->after('email_verified_at');
            $table->timestamp('two_factor_enabled_at')->nullable()->after('remember_token');
            $table->timestamp('last_login_at')->nullable()->after('two_factor_enabled_at');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'phone_country_code', 'phone_verified_at', 'avatar_url', 'two_factor_enabled_at', 'last_login_at', 'last_login_ip']);
        });
    }
};
