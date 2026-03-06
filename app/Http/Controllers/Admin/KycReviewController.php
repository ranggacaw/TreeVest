<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectKycRequest;
use App\Models\KycDocument;
use App\Models\KycVerification;
use App\Services\KycVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class KycReviewController extends Controller
{
    public function __construct(
        protected KycVerificationService $kycService
    ) {}

    public function index(Request $request)
    {
        $status = $request->get('status', 'submitted');

        $query = KycVerification::with(['user']);

        if ($status) {
            $query->where('status', $status);
        }

        $verifications = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Admin/Kyc/Index', [
            'verifications' => $verifications,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function show(KycVerification $verification)
    {
        $verification->load(['user', 'documents', 'verifiedBy']);

        return Inertia::render('Admin/Kyc/Show', [
            'verification' => $verification,
        ]);
    }

    public function approve(KycVerification $verification)
    {
        $result = $this->kycService->approveVerification($verification, auth()->user());

        if (! $result) {
            return back()->with('error', __('admin.kyc_cannot_approve'));
        }

        DashboardController::invalidateMetricsCache();

        return back()->with('success', __('admin.kyc_verified'));
    }

    public function reject(RejectKycRequest $request, KycVerification $verification)
    {
        $result = $this->kycService->rejectVerification(
            $verification,
            auth()->user(),
            $request->input('reason')
        );

        if (! $result) {
            return back()->with('error', __('admin.kyc_cannot_reject'));
        }

        DashboardController::invalidateMetricsCache();

        return back()->with('success', __('admin.kyc_rejected'));
    }

    public function documentPreview(KycDocument $document)
    {
        if (! Storage::disk('kyc_documents')->exists($document->file_path)) {
            abort(404, 'Document not found.');
        }

        $url = Storage::disk('kyc_documents')->temporaryUrl(
            $document->file_path,
            now()->addMinutes(5)
        );

        return redirect($url);
    }
}
