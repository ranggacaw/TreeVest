<?php

namespace App\Services;

use App\Enums\HarvestStatus;
use App\Enums\QualityGrade;
use App\Exceptions\InvalidHarvestTransitionException;
use App\Models\Harvest;
use App\Models\MarketPrice;
use App\Models\Tree;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class HarvestService
{
    public function scheduleHarvest(User $farmOwner, Tree $tree, array $data): Harvest
    {
        $harvest = new Harvest([
            'tree_id' => $tree->id,
            'fruit_crop_id' => $tree->fruit_crop_id,
            'scheduled_date' => Carbon::parse($data['scheduled_date']),
            'status' => HarvestStatus::Scheduled,
            'estimated_yield_kg' => $data['estimated_yield_kg'] ?? null,
            'platform_fee_rate' => $data['platform_fee_rate'] ?? config('harvests.default_platform_fee_rate', 0.05),
            'notes' => $data['notes'] ?? null,
            'reminders_sent' => [],
        ]);

        $harvest->save();

        event(new \App\Events\HarvestScheduled($harvest));

        return $harvest;
    }

    public function startHarvest(Harvest $harvest, User $actor): Harvest
    {
        $this->validateTransition($harvest->status, HarvestStatus::InProgress);

        $harvest->status = HarvestStatus::InProgress;
        $harvest->save();

        return $harvest;
    }

    public function failHarvest(Harvest $harvest, User $actor, string $notes): Harvest
    {
        $this->validateTransition($harvest->status, HarvestStatus::Failed);

        DB::transaction(function () use ($harvest, $notes) {
            $harvest->status = HarvestStatus::Failed;
            $harvest->notes = $harvest->notes ? $harvest->notes."\n\n".$notes : $notes;
            $harvest->failed_at = now();
            $harvest->save();
        });

        event(new \App\Events\HarvestFailed($harvest));

        return $harvest;
    }

    public function updateYieldEstimate(Harvest $harvest, float $kg, User $actor): Harvest
    {
        $harvest->estimated_yield_kg = $kg;
        $harvest->save();

        return $harvest;
    }

    public function recordActualYield(Harvest $harvest, float $kg, QualityGrade $grade, User $actor): Harvest
    {
        if (! in_array($harvest->status, [HarvestStatus::Scheduled, HarvestStatus::InProgress], true)) {
            throw new InvalidHarvestTransitionException(
                "Cannot record yield for harvest with status {$harvest->status->value}"
            );
        }

        $harvest->actual_yield_kg = $kg;
        $harvest->quality_grade = $grade;
        $harvest->save();

        return $harvest;
    }

    public function confirmComplete(Harvest $harvest, User $actor): Harvest
    {
        if ($harvest->actual_yield_kg === null) {
            throw new \InvalidArgumentException('Cannot complete harvest without recording actual yield');
        }

        $marketPrice = MarketPrice::where('fruit_type_id', $harvest->tree->fruitCrop->fruit_type_id)
            ->where('effective_date', '<=', now())
            ->orderBy('effective_date', 'desc')
            ->first();

        if ($marketPrice === null) {
            throw new \InvalidArgumentException('No market price found for this fruit type');
        }

        $this->validateTransition($harvest->status, HarvestStatus::Completed);

        DB::transaction(function () use ($harvest, $marketPrice, $actor) {
            $harvest->market_price_id = $marketPrice->id;
            $harvest->status = HarvestStatus::Completed;
            $harvest->confirmed_by = $actor->id;
            $harvest->confirmed_at = now();
            $harvest->completed_at = now();
            $harvest->save();
        });

        event(new \App\Events\HarvestCompleted($harvest));

        return $harvest;
    }

    public function validateTransition(HarvestStatus $from, HarvestStatus $to): void
    {
        if (! $from->canTransitionTo($to)) {
            throw new InvalidHarvestTransitionException(
                "Cannot transition from {$from->value} to {$to->value}"
            );
        }
    }
}
