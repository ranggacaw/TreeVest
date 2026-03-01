<?php

namespace App\Models;

use App\Enums\GeneratedReportStatus;
use App\Enums\ReportType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class GeneratedReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'report_type',
        'parameters',
        'status',
        'file_path',
        'failure_reason',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'report_type' => ReportType::class,
            'status' => GeneratedReportStatus::class,
            'parameters' => 'array',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === GeneratedReportStatus::Completed;
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function getFilePathAttribute(?string $value): ?string
    {
        return $value;
    }
}
