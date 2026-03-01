<?php

namespace App\Console\Commands;

use App\Enums\HarvestStatus;
use App\Enums\InvestmentStatus;
use App\Jobs\SendHarvestReminderNotification;
use App\Models\Harvest;
use App\Models\Investment;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendHarvestReminders extends Command
{
    protected $signature = 'app:send-harvest-reminders';

    protected $description = 'Send harvest reminders to investors for upcoming harvests';

    public function handle(): int
    {
        $today = Carbon::today();
        $sevenDaysFromNow = $today->copy()->addDays(7);
        $oneDayFromNow = $today->copy()->addDay();

        $harvests7Days = Harvest::where('status', HarvestStatus::Scheduled)
            ->where('scheduled_date', $sevenDaysFromNow)
            ->get();

        $harvests1Day = Harvest::where('status', HarvestStatus::Scheduled)
            ->where('scheduled_date', $oneDayFromNow)
            ->get();

        $totalRemindersSent = 0;

        foreach ($harvests7Days as $harvest) {
            $remindersSent = $harvest->reminders_sent ?? [];
            if (! in_array('7day', $remindersSent, true)) {
                $investments = Investment::where('tree_id', $harvest->tree_id)
                    ->where('status', InvestmentStatus::Active)
                    ->get();

                foreach ($investments as $investment) {
                    SendHarvestReminderNotification::dispatch(
                        $harvest,
                        $investment->user,
                        '7day'
                    );
                    $totalRemindersSent++;
                }

                $remindersSent[] = '7day';
                $harvest->reminders_sent = $remindersSent;
                $harvest->save();
            }
        }

        foreach ($harvests1Day as $harvest) {
            $remindersSent = $harvest->reminders_sent ?? [];
            if (! in_array('1day', $remindersSent, true)) {
                $investments = Investment::where('tree_id', $harvest->tree_id)
                    ->where('status', InvestmentStatus::Active)
                    ->get();

                foreach ($investments as $investment) {
                    SendHarvestReminderNotification::dispatch(
                        $harvest,
                        $investment->user,
                        '1day'
                    );
                    $totalRemindersSent++;
                }

                $remindersSent[] = '1day';
                $harvest->reminders_sent = $remindersSent;
                $harvest->save();
            }
        }

        $this->info("Sent {$totalRemindersSent} harvest reminders.");

        return self::SUCCESS;
    }
}
