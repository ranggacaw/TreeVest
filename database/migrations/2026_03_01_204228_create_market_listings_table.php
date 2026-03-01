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
        Schema::create('market_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investment_id')->constrained()->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('ask_price_cents');
            $table->char('currency', 3)->default('MYR');
            $table->decimal('platform_fee_rate', 5, 4);
            $table->unsignedBigInteger('platform_fee_cents');
            $table->unsignedBigInteger('net_proceeds_cents');
            $table->enum('status', ['active', 'sold', 'cancelled'])->default('active');
            $table->foreignId('buyer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('purchased_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('investment_id');
            $table->index('seller_id');
            $table->index('status');
            $table->index('buyer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('market_listings');
    }
};
