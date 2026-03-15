<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayoutController extends Controller
{
    public function index(Request $request): Response
    {
        $payouts = Payout::with([
            'harvest.tree',
            'harvest.tree.fruitCrop',
            'harvest.tree.fruitCrop.farm',
            'investment.tree',
            'investment.tree.fruitCrop',
            'investment.tree.fruitCrop.farm',
            'investment.lot',
            'investment.lot.fruitCrop',
            'investment.lot.fruitCrop.farm',
        ])
            ->where('investor_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Investor/Payouts/Index', [
            'payouts' => $payouts,
        ]);
    }

    public function show(Payout $payout): Response
    {
        if ($payout->investor_id !== auth()->id()) {
            abort(403);
        }

        $payout->load([
            'harvest.tree',
            'harvest.tree.fruitCrop',
            'harvest.tree.fruitCrop.farm',
            'investment.tree',
            'investment.tree.fruitCrop',
            'investment.tree.fruitCrop.farm',
            'investment.lot',
            'investment.lot.fruitCrop',
            'investment.lot.fruitCrop.farm',
            'transaction',
        ]);

        return Inertia::render('Investor/Payouts/Show', [
            'payout' => $payout,
        ]);
    }
}
