<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('content_translations', function (Blueprint $table) {
            $table->id();
            $table->morphs('translatable');
            $table->string('locale')->index();
            $table->string('field')->index();
            $table->text('value');
            $table->enum('status', ['draft', 'machine_translated', 'under_review', 'approved'])->default('draft')->index();
            $table->enum('source', ['human', 'machine'])->default('human')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            // Prevent duplicate translations for the same model + field + locale
            $table->unique(['translatable_type', 'translatable_id', 'locale', 'field'], 'content_trans_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_translations');
    }
};
