<?php

namespace App\Services;

use App\Enums\LegalDocumentType;
use App\Models\LegalDocument;
use App\Models\UserDocumentAcceptance;
use Illuminate\Support\Facades\Request;

class LegalDocumentService
{
    /**
     * Get the currently active legal document for a given type.
     */
    public function getActiveDocument(LegalDocumentType $type): ?LegalDocument
    {
        return LegalDocument::where('type', $type)
            ->where('is_active', true)
            ->where('effective_date', '<=', now())
            ->latest('effective_date')
            ->first();
    }

    /**
     * Track user acceptance of a legal document.
     */
    public function trackAcceptance(int $userId, int $documentId): UserDocumentAcceptance
    {
        return UserDocumentAcceptance::create([
            'user_id' => $userId,
            'legal_document_id' => $documentId,
            'accepted_at' => now(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }

    /**
     * Check if user has accepted the latest version of a document.
     */
    public function hasAcceptedLatest(int $userId, LegalDocumentType $type): bool
    {
        $document = $this->getActiveDocument($type);

        if (! $document) {
            return false; // Or true if optional? Usually document must exist.
        }

        return UserDocumentAcceptance::where('user_id', $userId)
            ->where('legal_document_id', $document->id)
            ->exists();
    }
}
