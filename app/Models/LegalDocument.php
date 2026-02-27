<?php

namespace App\Models;

use App\Enums\LegalDocumentType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LegalDocument extends Model
{
    protected $fillable = [
        'type',
        'version',
        'title',
        'content',
        'effective_date',
        'is_active',
    ];

    protected $casts = [
        'type' => LegalDocumentType::class,
        'effective_date' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function acceptances(): HasMany
    {
        return $this->hasMany(UserDocumentAcceptance::class);
    }
}
