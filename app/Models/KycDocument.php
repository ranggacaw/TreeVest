<?php

namespace App\Models;

use App\Enums\KycDocumentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class KycDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'kyc_verification_id',
        'document_type',
        'file_path',
        'original_filename',
        'mime_type',
        'file_size',
        'uploaded_at',
    ];

    protected function casts(): array
    {
        return [
            'document_type' => KycDocumentType::class,
            'uploaded_at' => 'datetime',
            'file_size' => 'integer',
        ];
    }

    public function verification(): BelongsTo
    {
        return $this->belongsTo(KycVerification::class, 'kyc_verification_id');
    }

    public function getFileSizeInMb(): float
    {
        return round($this->file_size / 1024 / 1024, 2);
    }

    public function getTemporaryUrl(int $expiresInMinutes = 60): string
    {
        $disk = Storage::disk('kyc_documents');

        if (method_exists($disk, 'temporaryUrl')) {
            return $disk->temporaryUrl(
                $this->file_path,
                now()->addMinutes($expiresInMinutes)
            );
        }

        $verification = $this->verification;
        $signature = hash_hmac('sha256', $this->file_path.$expiresInMinutes, config('app.key'));
        $expires = now()->addMinutes($expiresInMinutes)->timestamp;

        return route('kyc.document.preview', [
            'document' => $this->id,
            'signature' => $signature,
            'expires' => $expires,
        ]);
    }
}
