<?php

namespace App\Http\Controllers;

use App\Enums\LegalDocumentType;
use App\Services\LegalDocumentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LegalDocumentController extends Controller
{
    public function __construct(
        protected LegalDocumentService $legalDocumentService
    ) {}

    /**
     * Display the Privacy Policy.
     */
    public function privacyPolicy(): Response
    {
        return $this->showDocument(LegalDocumentType::PRIVACY_POLICY, 'Legal/PrivacyPolicy');
    }

    /**
     * Display the Terms of Service.
     */
    public function termsOfService(): Response
    {
        return $this->showDocument(LegalDocumentType::TERMS_OF_SERVICE, 'Legal/TermsOfService');
    }

    /**
     * Display the Risk Disclosure.
     */
    public function riskDisclosure(): Response
    {
        return $this->showDocument(LegalDocumentType::RISK_DISCLOSURE, 'Legal/RiskDisclosure');
    }

    /**
     * Show a legal document.
     */
    protected function showDocument(LegalDocumentType $type, string $component): Response
    {
        $document = $this->legalDocumentService->getActiveDocument($type);

        return Inertia::render($component, [
            'document' => $document,
        ]);
    }

    /**
     * Accept a legal document.
     */
    public function accept(Request $request, string $type): RedirectResponse
    {
        // Validate type exists in Enum
        $enumType = LegalDocumentType::tryFrom($type);
        if (! $enumType) {
            abort(404);
        }

        $document = $this->legalDocumentService->getActiveDocument($enumType);

        if (! $document) {
            abort(404, 'Document not found.');
        }

        $this->legalDocumentService->trackAcceptance($request->user()->id, $document->id);

        return back()->with('status', 'Document accepted successfully.');
    }
}
