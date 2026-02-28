<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class FarmImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'file_path',
        'original_filename',
        'mime_type',
        'file_size',
        'caption',
        'is_featured',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
            'file_size' => 'integer',
        ];
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->file_path);
    }

    public function getTemporaryUrlAttribute(): string
    {
        return Storage::disk('public')->temporaryUrl(
            $this->file_path,
            now()->addMinutes(60)
        );
    }

    public function markAsFeatured(): void
    {
        $this->farm->images()->where('is_featured', true)->update(['is_featured' => false]);
        $this->is_featured = true;
        $this->save();
    }
}
