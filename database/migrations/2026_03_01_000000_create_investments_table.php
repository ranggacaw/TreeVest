<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('tree_id')->constrained('trees')->onDelete('cascade');
            $table->unsignedBigInteger('amount_cents');
            $table->string('currency', 3)->default('MYR');
            $table->date('purchase_date');
            $table->string('status', 50);
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->onDelete('set null');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('tree_id');
            $table->index('status');
            $table->index('purchase_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investments');
    }
};
