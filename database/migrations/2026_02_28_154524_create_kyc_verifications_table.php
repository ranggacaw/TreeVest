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
        Schema::create('kyc_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->char('jurisdiction_code', 2)->default('MY');
            $table->enum('status', ['pending', 'submitted', 'verified', 'rejected'])->default('pending');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('verified_by_admin_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('expires_at')->nullable();
            $table->string('provider', 50)->default('manual');
            $table->string('provider_reference_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kyc_verifications');
    }
};
