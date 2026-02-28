<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\Auth\OAuthController;
use App\Http\Controllers\Auth\TwoFactorController;
use App\Http\Controllers\AvatarController;
use App\Http\Controllers\EncyclopediaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SessionController;
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
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

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

    Route::post('/account/deactivate', [AccountController::class, 'deactivate'])->name('account.deactivate');
    Route::post('/account/delete-request', [AccountController::class, 'requestDeletion'])->name('account.delete-request');
});

require __DIR__.'/auth.php';

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
        Route::get('/dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard');

        Route::resource('articles', AdminArticleController::class);
        Route::post('articles/{article}/publish', [AdminArticleController::class, 'publish'])->name('articles.publish');
        Route::post('articles/{article}/unpublish', [AdminArticleController::class, 'unpublish'])->name('articles.unpublish');
    });
});

Route::middleware(['auth', 'role:farm_owner'])->group(function () {
    Route::prefix('farm-owner')->name('farm-owner.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('FarmOwner/Dashboard');
        })->name('dashboard');
    });
});

Route::middleware(['auth', 'role:investor'])->group(function () {
    Route::prefix('investor')->name('investor.')->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Investor/Dashboard');
        })->name('dashboard');
    });
});

Route::prefix('education')->name('education.')->group(function () {
    Route::get('/', [ArticleController::class, 'index'])->name('index');
    Route::get('/{article:slug}', [ArticleController::class, 'show'])->name('show');
});

Route::prefix('encyclopedia')->name('encyclopedia.')->group(function () {
    Route::get('/', [EncyclopediaController::class, 'index'])->name('index');
    Route::get('/{article:slug}', [EncyclopediaController::class, 'show'])->name('show');
});
