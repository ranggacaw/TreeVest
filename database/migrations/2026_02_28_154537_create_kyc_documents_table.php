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
        Schema::create('kyc_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kyc_verification_id')->constrained()->onDelete('cascade');
            $table->enum('document_type', ['passport', 'national_id', 'drivers_license', 'proof_of_address']);
            $table->text('file_path');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kyc_documents');
    }
};
