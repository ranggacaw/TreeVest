<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\FarmOwner\DashboardController as FarmOwnerDashboardController;
use App\Http\Controllers\Investor\DashboardController as InvestorDashboardController;
use App\Http\Controllers\Admin\InvestmentController as AdminInvestmentController;
use App\Http\Controllers\Admin\KycReviewController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\FarmApprovalController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\NotificationTemplateController as AdminNotificationTemplateController;
use App\Http\Controllers\Admin\MarketListingController as AdminMarketListingController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\EncyclopediaController;
use App\Http\Controllers\FarmController;
use App\Http\Controllers\FarmOwner\HealthUpdateController as FarmOwnerHealthUpdateController;
use App\Http\Controllers\GdprController;
use App\Http\Controllers\InvestmentController;
use App\Http\Controllers\Investor\HealthFeedController as InvestorHealthFeedController;
use App\Http\Controllers\Investor\PayoutController;
use App\Http\Controllers\Investor\ReportController;
use App\Http\Controllers\Investor\TaxReportController;
use App\Http\Controllers\KycController;
use App\Http\Controllers\MarketplaceFarmController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationPreferenceController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\PortfolioDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProfileLocaleController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\Auth\TwoFactorController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

Route::get('/dashboard', function () {
    $user = auth()->user();
    if ($user->hasRole('admin')) {
        return redirect()->route('admin.dashboard');
    }
    if ($user->hasRole('farm_owner')) {
        return redirect()->route('farm-owner.dashboard');
    }
    if ($user->hasRole('investor')) {
        return redirect()->route('investor.dashboard');
    }
    // Fallback: no specific role assigned yet
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::patch('/profile/locale', [ProfileLocaleController::class, 'update'])->name('profile.locale');

    Route::get('/profile/2fa', [TwoFactorController::class, 'show'])->name('profile.2fa');
    Route::post('/profile/2fa/enable', [TwoFactorController::class, 'enable'])->name('profile.2fa.enable');
    Route::post('/profile/2fa/confirm', [TwoFactorController::class, 'confirmEnable'])->name('profile.2fa.confirm');
    Route::post('/profile/2fa/disable', [TwoFactorController::class, 'disable'])->name('profile.2fa.disable');
    Route::post('/profile/2fa/recovery-codes', [TwoFactorController::class, 'regenerateRecoveryCodes'])->name('profile.2fa.recovery-codes');

    Route::get('/profile/sessions', [SessionController::class, 'index'])->name('profile.sessions');
    Route::delete('/profile/sessions/{id}', [SessionController::class, 'destroy'])->name('profile.sessions.destroy');
    Route::post('/profile/sessions/revoke-all', [SessionController::class, 'destroyAll'])->name('profile.sessions.revoke-all');

    Route::post('/profile/avatar', [AvatarController::class, 'store'])->name('profile.avatar.store');
    Route::delete('/profile/avatar', [AvatarController::class, 'destroy'])->name('profile.avatar.destroy');

    Route::post('/auth/{provider}/link', [OAuthController::class, 'link'])->name('oauth.link');
    Route::delete('/profile/oauth/{provider}', [OAuthController::class, 'unlink'])->name('oauth.unlink');

    Route::get('/profile/account-settings', [AccountController::class, 'settings'])->name('profile.account-settings');
    Route::post('/account/deactivate', [AccountController::class, 'deactivate'])->name('account.deactivate');
    Route::post('/account/delete-request', [AccountController::class, 'requestDeletion'])->name('account.delete-request');

    Route::prefix('profile/kyc')->name('kyc.')->group(function () {
        Route::get('/', [KycController::class, 'index'])->name('index');
        Route::get('/upload', [KycController::class, 'upload'])->name('upload');
        Route::post('/', [KycController::class, 'store'])->name('store')->middleware('throttle:kyc-upload');
        Route::post('/submit', [KycController::class, 'submit'])->name('submit');
        Route::get('/{verification}', [KycController::class, 'show'])->name('show');
    });

    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/{id}', [NotificationController::class, 'show'])->name('show');
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('read-all');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/notifications', [NotificationPreferenceController::class, 'index'])->name('notifications');
        Route::post('/notifications', [NotificationPreferenceController::class, 'update'])->name('notifications.update');
    });
});

require __DIR__ . '/auth.php';

Route::controller(\App\Http\Controllers\LegalDocumentController::class)->group(function () {
    Route::get('/legal/privacy', 'privacyPolicy')->name('legal.privacy');
    Route::get('/legal/terms', 'termsOfService')->name('legal.terms');
    Route::get('/legal/risk', 'riskDisclosure')->name('legal.risk');
    Route::post('/legal/accept/{type}', 'accept')
        ->middleware(['auth', 'throttle:6,1'])
        ->name('legal.accept');
});

Route::middleware('auth')->group(function () {
    Route::post('/account/data-export', [\App\Http\Controllers\GdprController::class, 'export'])->name('account.export');
    Route::post('/account/delete', [\App\Http\Controllers\GdprController::class, 'destroy'])->name('account.delete');
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('articles', AdminArticleController::class);
        Route::post('articles/{article}/publish', [AdminArticleController::class, 'publish'])->name('articles.publish');
        Route::post('articles/{article}/unpublish', [AdminArticleController::class, 'unpublish'])->name('articles.unpublish');

        Route::resource('users', UserController::class);
        Route::patch('users/{user}/role', [UserController::class, 'update'])->name('users.update-role');
        Route::post('users/{user}/suspend', [UserController::class, 'suspend'])->name('users.suspend');
        Route::post('users/{user}/reactivate', [UserController::class, 'reactivate'])->name('users.reactivate');

        Route::resource('kyc', KycReviewController::class);
        Route::post('kyc/{verification}/approve', [KycReviewController::class, 'approve'])->name('kyc.approve');
        Route::post('kyc/{verification}/reject', [KycReviewController::class, 'reject'])->name('kyc.reject');
        Route::get('kyc/documents/{document}/preview', [KycReviewController::class, 'documentPreview'])->name('kyc.document-preview');

        Route::resource('investments', AdminInvestmentController::class);

        Route::resource('audit-logs', AuditLogController::class)->only(['index', 'show']);

        Route::resource('farms', FarmApprovalController::class);
        Route::post('farms/{farm}/approve', [FarmApprovalController::class, 'approve'])->name('farms.approve');
        Route::post('farms/{farm}/reject', [FarmApprovalController::class, 'reject'])->name('farms.reject');
        Route::post('farms/{farm}/suspend', [FarmApprovalController::class, 'suspend'])->name('farms.suspend');
        Route::post('farms/{farm}/reinstate', [FarmApprovalController::class, 'reinstate'])->name('farms.reinstate');

        Route::resource('notification-templates', AdminNotificationTemplateController::class);

        Route::prefix('market-prices')->name('market-prices.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\MarketPriceController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Admin\MarketPriceController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\Admin\MarketPriceController::class, 'store'])->name('store');
            Route::get('/{marketPrice}/edit', [\App\Http\Controllers\Admin\MarketPriceController::class, 'edit'])->name('edit');
            Route::patch('/{marketPrice}', [\App\Http\Controllers\Admin\MarketPriceController::class, 'update'])->name('update');
        });

        Route::prefix('harvests')->name('harvests.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\HarvestController::class, 'index'])->name('index');
            Route::get('/{harvest}', [\App\Http\Controllers\Admin\HarvestController::class, 'show'])->name('show');
        });

        Route::prefix('translations')->name('translations.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\TranslationController::class, 'index'])->name('index');
            Route::get('/queue', [\App\Http\Controllers\Admin\TranslationController::class, 'queue'])->name('queue');
            Route::post('/queue/batch-approve', [\App\Http\Controllers\Admin\TranslationController::class, 'batchApprove'])->name('batch-approve');
            Route::post('/queue/{id}/approve', [\App\Http\Controllers\Admin\TranslationController::class, 'approve'])->name('approve');
            Route::post('/queue/{id}/reject', [\App\Http\Controllers\Admin\TranslationController::class, 'reject'])->name('reject');
            Route::get('/list/{type}', [\App\Http\Controllers\Admin\TranslationController::class, 'list'])->name('list');
            Route::get('/{type}/{id}/edit', [\App\Http\Controllers\Admin\TranslationController::class, 'edit'])->name('edit');
            Route::patch('/{type}/{id}', [\App\Http\Controllers\Admin\TranslationController::class, 'update'])->name('update');
            Route::post('/{type}/{id}/draft', [\App\Http\Controllers\Admin\TranslationController::class, 'generateDraft'])->name('draft');
        });

        Route::post('/media/upload', [MediaController::class, 'upload'])->name('media.upload');
        Route::delete('/media/delete', [MediaController::class, 'delete'])->name('media.delete');
    });
});

Route::middleware(['auth', 'role:farm_owner'])->group(function () {
    Route::prefix('farm-owner')->name('farm-owner.')->group(function () {
        Route::get('/dashboard', [FarmOwnerDashboardController::class, 'index'])->name('dashboard');

        Route::prefix('health-updates')->name('health-updates.')->group(function () {
            Route::get('/', [FarmOwnerHealthUpdateController::class, 'index'])->name('index');
            Route::get('/create', [FarmOwnerHealthUpdateController::class, 'create'])->name('create');
            Route::post('/', [FarmOwnerHealthUpdateController::class, 'store'])->name('store');
            Route::get('/{healthUpdate}/edit', [FarmOwnerHealthUpdateController::class, 'edit'])->name('edit');
            Route::put('/{healthUpdate}', [FarmOwnerHealthUpdateController::class, 'update'])->name('update');
            Route::delete('/{healthUpdate}', [FarmOwnerHealthUpdateController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('harvests')->name('harvests.')->group(function () {
            Route::get('/', [\App\Http\Controllers\FarmOwner\HarvestController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\FarmOwner\HarvestController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\FarmOwner\HarvestController::class, 'store'])->name('store');
            Route::get('/{harvest}', [\App\Http\Controllers\FarmOwner\HarvestController::class, 'show'])->name('show');
            Route::post('/{harvest}/start', [\App\Http\Controllers\FarmOwner\HarvestController::class, 'startHarvest'])->name('start');
            Route::post('/{harvest}/record-yield', [\App\Http\Controllers\FarmOwner\HarvestController::class, 'recordYield'])->name('record-yield');
            Route::post('/{harvest}/confirm', [\App\Http\Controllers\FarmOwner\HarvestController::class, 'confirm'])->name('confirm');
            Route::post('/{harvest}/fail', [\App\Http\Controllers\FarmOwner\HarvestController::class, 'fail'])->name('fail');
        });
    });

    Route::prefix('farms/manage')->name('farms.manage.')->group(function () {
        Route::get('/', [FarmController::class, 'index'])->name('index');
        Route::get('/create', [FarmController::class, 'create'])->name('create');
        Route::post('/', [FarmController::class, 'store'])->name('store');
        Route::get('/{farm}', [FarmController::class, 'show'])->name('show');
        Route::get('/{farm}/edit', [FarmController::class, 'edit'])->name('edit');
        Route::put('/{farm}', [FarmController::class, 'update'])->name('update');
        Route::delete('/{farm}', [FarmController::class, 'destroy'])->name('destroy');
        Route::delete('/{farm}/images/{image}', [FarmController::class, 'deleteImage'])->name('images.destroy');
    });
});

Route::middleware(['auth', 'role:investor'])->group(function () {
    Route::prefix('investor')->name('investor.')->group(function () {
        Route::get('/dashboard', [InvestorDashboardController::class, 'index'])->name('dashboard');

        Route::prefix('payouts')->name('payouts.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Investor\PayoutController::class, 'index'])->name('index');
            Route::get('/{payout}', [\App\Http\Controllers\Investor\PayoutController::class, 'show'])->name('show');
        });
    });

    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->name('index');
        Route::post('/pdf', [ReportController::class, 'requestPdf'])->name('pdf.request')->middleware('throttle:report-pdf');
        Route::get('/csv', [ReportController::class, 'exportCsv'])->name('csv');
        Route::get('/download/{report}', [ReportController::class, 'download'])->name('download');
        Route::get('/tax', fn() => redirect()->route('reports.tax.show', ['year' => now()->year]))->name('tax');
        Route::get('/tax/{year}', [TaxReportController::class, 'show'])->name('tax.show');
        Route::post('/tax/{year}/pdf', [TaxReportController::class, 'requestPdf'])->name('tax.pdf.request')->middleware('throttle:report-pdf');
        Route::get('/tax/{year}/csv', [TaxReportController::class, 'exportCsv'])->name('tax.csv');
    });

    Route::get('/portfolio', [PortfolioDashboardController::class, 'index'])->name('portfolio.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::prefix('payment-methods')->name('payment-methods.')->group(function () {
        Route::get('/', [PaymentMethodController::class, 'index'])->name('index');
        Route::post('/', [PaymentMethodController::class, 'store'])->name('store');
        Route::delete('/{paymentMethod}', [PaymentMethodController::class, 'destroy'])->name('destroy');
        Route::patch('/{paymentMethod}/set-default', [PaymentMethodController::class, 'setDefault'])->name('set-default');
    });

    Route::prefix('investments')->name('investments.')->group(function () {
        Route::get('/', [InvestmentController::class, 'index'])->name('index');
        Route::get('/create/{tree}', [InvestmentController::class, 'create'])->name('create');
        Route::post('/', [InvestmentController::class, 'store'])->name('store');
        Route::get('/{investment}', [InvestmentController::class, 'show'])->name('show');
        Route::get('/{investment}/confirmation', [InvestmentController::class, 'confirmation'])->name('confirmation');
        Route::post('/{investment}/cancel', [InvestmentController::class, 'cancel'])->name('cancel');
        Route::get('/{investment}/top-up', [InvestmentController::class, 'topUpForm'])->name('top-up.form');
        Route::post('/{investment}/top-up', [InvestmentController::class, 'topUp'])->name('top-up');

        if (app()->environment('local')) {
            Route::post('/{investment}/mock-confirm', [InvestmentController::class, 'mockConfirm'])->name('mock-confirm');
        }

        Route::get('/health-feed', [InvestorHealthFeedController::class, 'index'])->name('health-feed.index');
        Route::get('/health-feed/{healthUpdate}', [InvestorHealthFeedController::class, 'show'])->name('health-feed.show');
        Route::get('/health-alerts', [InvestorHealthFeedController::class, 'alerts'])->name('health-alerts');
    });
});

Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])->name('stripe.webhook');

Route::prefix('farms')->name('farms.')->group(function () {
    Route::get('/', [MarketplaceFarmController::class, 'index'])->name('index');
    Route::get('/nearby', [MarketplaceFarmController::class, 'nearby'])->name('nearby');
    Route::get('/{farm}', [MarketplaceFarmController::class, 'show'])->name('show');
});

Route::prefix('education')->name('education.')->group(function () {
    Route::get('/', [ArticleController::class, 'index'])->name('index');
    Route::get('/{article:slug}', [ArticleController::class, 'show'])->name('show');
});

Route::prefix('encyclopedia')->name('encyclopedia.')->group(function () {
    Route::get('/', [EncyclopediaController::class, 'index'])->name('index');
    Route::get('/{article:slug}', [EncyclopediaController::class, 'show'])->name('show');
});

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

Route::middleware(['auth', 'kyc.verified'])->get('/test-kyc-protected', function () {
    return response()->json(['message' => 'KYC verified']);
});

Route::middleware('auth')->prefix('secondary-market')->name('secondary-market.')->group(function () {
    Route::get('/', [\App\Http\Controllers\SecondaryMarket\ListingController::class, 'index'])->name('index');
    Route::get('/create', [\App\Http\Controllers\SecondaryMarket\ListingController::class, 'create'])->name('create');
    Route::post('/', [\App\Http\Controllers\SecondaryMarket\ListingController::class, 'store'])->name('store');
    Route::get('/{listing}', [\App\Http\Controllers\SecondaryMarket\ListingController::class, 'show'])->name('show');
    Route::delete('/{listing}', [\App\Http\Controllers\SecondaryMarket\ListingController::class, 'destroy'])->name('destroy');
    Route::post('/{listing}/purchase', [\App\Http\Controllers\SecondaryMarket\PurchaseController::class, 'store'])->name('purchase.store');
    Route::post('/{listing}/purchase/confirm', [\App\Http\Controllers\SecondaryMarket\PurchaseController::class, 'confirm'])->name('purchase.confirm');
});

Route::middleware(['auth', 'role:admin'])->prefix('admin/market-listings')->name('admin.market-listings.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\MarketListingController::class, 'index'])->name('index');
    Route::delete('/{listing}', [\App\Http\Controllers\Admin\MarketListingController::class, 'destroy'])->name('destroy');
});

// Fallback for missing storage images
Route::get('storage/{path}', function ($path) {
    if (preg_match('/\.(jpg|jpeg|png|gif|webp)$/i', $path)) {
        $filename = pathinfo($path, PATHINFO_FILENAME);
        // Replace dashes and underscores with spaces for a better avatar letter
        $name = str_replace(['-', '_'], ' ', $filename);
        return redirect('https://placehold.co/600x400/png?text=' . urlencode($name));
    }
    abort(404);
})->where('path', '.*');
