<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ErrorTrackingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ErrorReportController extends Controller
{
    public function __construct(
        protected ErrorTrackingService $errorTrackingService
    ) {}

    /**
     * Report a client-side error to the error tracking service
     */
    public function reportClientError(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'stack' => 'nullable|string|max:5000',
            'component' => 'nullable|string|max:255',
            'error_boundary' => 'nullable|string|max:255',
            'component_stack' => 'nullable|string|max:5000',
            'props' => 'nullable|array',
            'url' => 'nullable|string|max:500',
            'user_agent' => 'nullable|string|max:500',
        ]);

        try {
            $errorInfo = [
                'message' => $request->input('message'),
                'stack' => $request->input('stack'),
                'component' => $request->input('component'),
                'error_boundary' => $request->input('error_boundary'),
                'component_stack' => $request->input('component_stack'),
                'props' => $request->input('props'),
                'url' => $request->input('url', $request->headers->get('referer')),
                'user_agent' => $request->input('user_agent', $request->userAgent()),
                'timestamp' => now()->toISOString(),
            ];

            $userId = Auth::id();

            $this->errorTrackingService->reportUIError($errorInfo, $userId);

            return response()->json([
                'success' => true,
                'message' => 'Error reported successfully',
            ]);
        } catch (\Throwable $e) {
            // Don't let error reporting itself fail the response
            return response()->json([
                'success' => false,
                'message' => 'Failed to report error',
            ], 500);
        }
    }

    /**
     * Get error tracking configuration for client-side
     */
    public function getConfig(): JsonResponse
    {
        return response()->json([
            'error_tracking' => [
                'enabled' => $this->errorTrackingService->isEnabled(),
                'endpoint' => route('api.error.report'),
            ],
        ]);
    }
}
