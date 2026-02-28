<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farm_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('issuer')->nullable();
            $table->string('certificate_number')->nullable();
            $table->date('issued_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('file_path')->nullable()->comment('Path to certificate document');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('farm_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farm_certifications');
    }
};
