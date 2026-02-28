<?php

use App\Enums\FarmStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('latitude', 20)->nullable();
            $table->string('longitude', 20)->nullable();
            $table->decimal('size_hectares', 10, 2)->nullable();
            $table->integer('capacity_trees')->nullable();
            $table->enum('status', array_column(FarmStatus::cases(), 'value'))->default(FarmStatus::PENDING_APPROVAL->value);
            $table->text('soil_type')->nullable();
            $table->text('climate')->nullable();
            $table->text('historical_performance')->nullable();
            $table->string('virtual_tour_url')->nullable()->comment('External URL for virtual tour');
            $table->text('rejection_reason')->nullable()->comment('Reason if rejected by admin');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('owner_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farms');
    }
};
