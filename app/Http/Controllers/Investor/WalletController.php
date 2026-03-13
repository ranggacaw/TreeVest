<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Investor\StoreWithdrawalRequest;
use App\Services\WalletService;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function __construct(
        private readonly WalletService $walletService,
    ) {}

    public function index(): Response
    {
        $wallet = $this->walletService->getOrCreateWallet(auth()->user());
        $transactions = $wallet->transactions()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Investor/Wallet/Index', [
            'wallet' => [
                'id' => $wallet->id,
                'balance_cents' => $wallet->balance_cents,
                'formatted_balance' => $wallet->formatted_balance,
                'currency' => $wallet->currency,
            ],
            'transactions' => $transactions,
        ]);
    }

    public function withdraw(StoreWithdrawalRequest $request)
    {
        $validated = $request->validated();

        try {
            $this->walletService->initiateWithdrawal(auth()->user(), $validated['amount_cents']);

            return back()->with('success', 'Withdrawal submitted. Processing time: 1–3 business days.');
        } catch (\App\Exceptions\InsufficientWalletBalanceException $e) {
            return back()->withErrors(['amount_cents' => $e->getMessage()]);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['amount_cents' => $e->getMessage()]);
        }
    }
}
