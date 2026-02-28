<?php

namespace App\Http\Controllers;

use App\Enums\KycDocumentType;
use App\Http\Requests\StoreKycDocumentRequest;
use App\Http\Requests\SubmitKycVerificationRequest;
use App\Models\KycDocument;
use App\Models\KycVerification;
use App\Services\KycVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class KycController extends Controller
{
    public function __construct(
        protected KycVerificationService $kycService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $verification = $this->kycService->getLatestVerification($user);

        $jurisdiction = config('treevest.kyc.default_jurisdiction', 'MY');
        $requiredDocuments = config("treevest.kyc.jurisdictions.{$jurisdiction}.required_documents", []);
        $optionalDocuments = config("treevest.kyc.jurisdictions.{$jurisdiction}.optional_documents", []);

        return Inertia::render('Profile/KycVerification/Index', [
            'verification' => $verification ? [
                'id' => $verification->id,
                'status' => $verification->status->value,
                'submitted_at' => $verification->submitted_at?->toIso8601String(),
                'verified_at' => $verification->verified_at?->toIso8601String(),
                'rejected_at' => $verification->rejected_at?->toIso8601String(),
                'rejection_reason' => $verification->rejection_reason,
                'expires_at' => $verification->expires_at?->toIso8601String(),
                'has_required_documents' => $verification->hasRequiredDocuments(),
                'documents' => $verification->documents->map(fn (KycDocument $doc) => [
                    'id' => $doc->id,
                    'document_type' => $doc->document_type->value,
                    'original_filename' => $doc->original_filename,
                    'file_size' => $doc->getFileSizeInMb(),
                    'uploaded_at' => $doc->uploaded_at->toIso8601String(),
                ]),
            ] : null,
            'required_documents' => $requiredDocuments,
            'optional_documents' => $optionalDocuments,
            'max_file_size' => config('treevest.kyc.max_file_size', 10) * 1024 * 1024,
            'allowed_mime_types' => config('treevest.kyc.allowed_document_types', [
                'image/jpeg',
                'image/png',
                'application/pdf',
            ]),
        ]);
    }

    public function upload(Request $request)
    {
        $user = $request->user();
        $verification = $this->kycService->createOrUpdateVerification($user);

        return Inertia::render('Profile/KycVerification/Upload', [
            'verification' => [
                'id' => $verification->id,
                'documents' => $verification->documents->map(fn (KycDocument $doc) => [
                    'id' => $doc->id,
                    'document_type' => $doc->document_type->value,
                    'original_filename' => $doc->original_filename,
                    'file_size' => $doc->getFileSizeInMb(),
                    'uploaded_at' => $doc->uploaded_at->toIso8601String(),
                ]),
            ],
        ]);
    }

    public function store(StoreKycDocumentRequest $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:'.(config('treevest.kyc.max_file_size', 10) * 1024),
                'mimes:jpg,jpeg,png,pdf',
                'mimetypes:'.implode(',', config('treevest.kyc.allowed_document_types', [
                    'image/jpeg',
                    'image/png',
                    'application/pdf',
                ])),
            ],
        ]);

        $user = $request->user();
        $verification = $this->kycService->getLatestVerification($user);

        if (! $verification || $verification->status->value !== 'pending') {
            return back()->with('error', 'Cannot upload documents. Please start a new verification.');
        }

        $documentType = KycDocumentType::from($request->document_type);

        $this->kycService->uploadDocument(
            $verification,
            $documentType,
            $request->file('file'),
            $request->file('file')->getClientOriginalName(),
            $request->file('file')->getMimeType(),
            $request->file('file')->getSize()
        );

        return back()->with('success', 'Document uploaded successfully.');
    }

    public function submit(SubmitKycVerificationRequest $request)
    {
        $user = $request->user();
        $verification = $this->kycService->getLatestVerification($user);

        if (! $verification) {
            return back()->with('error', 'No verification found. Please upload your documents first.');
        }

        if (! $this->kycService->submitForReview($verification)) {
            return back()->with('error', 'Please upload all required documents before submitting.');
        }

        return Redirect::route('kyc.index')->with('success', 'Your verification has been submitted for review.');
    }

    public function show(Request $request, KycVerification $verification)
    {
        if ($request->user()->id !== $verification->user_id && ! $request->user()->isAdmin()) {
            abort(403);
        }

        return Inertia::render('Profile/KycVerification/Show', [
            'verification' => [
                'id' => $verification->id,
                'status' => $verification->status->value,
                'submitted_at' => $verification->submitted_at?->toIso8601String(),
                'verified_at' => $verification->verified_at?->toIso8601String(),
                'rejected_at' => $verification->rejected_at?->toIso8601String(),
                'rejection_reason' => $verification->rejection_reason,
                'expires_at' => $verification->expires_at?->toIso8601String(),
                'provider' => $verification->provider,
                'documents' => $verification->documents->map(fn (KycDocument $doc) => [
                    'id' => $doc->id,
                    'document_type' => $doc->document_type->value,
                    'original_filename' => $doc->original_filename,
                    'file_size' => $doc->getFileSizeInMb(),
                    'uploaded_at' => $doc->uploaded_at->toIso8601String(),
                ]),
            ],
        ]);
    }
}
