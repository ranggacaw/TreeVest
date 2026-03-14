<?php

namespace App\Notifications;

use App\Models\InvestmentTransfer;
use App\Models\MarketListing;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SecondarySaleSoldNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public MarketListing $listing,
        public InvestmentTransfer $transfer,
        public User $buyer
    ) {}

    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if ($notifiable->email) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Investment Has Been Sold!')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Great news! Your investment has been sold on the secondary market.')
            ->line('**Investment:** Tree #'.$this->listing->investment->tree->identifier)
            ->line('**Sale Price:** '.$this->listing->formatted_ask_price)
            ->line('**Platform Fee:** '.$this->listing->formatted_platform_fee)
            ->line('**Net Proceeds:** '.$this->listing->formatted_net_proceeds)
            ->line('**Sold To:** User #'.$this->buyer->id)
            ->action('View Sale Details', url('/secondary-market/'.$this->listing->id))
            ->line('Thank you for using Treevest!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'listing_id' => $this->listing->id,
            'investment_id' => $this->listing->investment_id,
            'buyer_id' => $this->buyer->id,
            'transfer_price_idr' => $this->transfer->transfer_price_idr,
            'platform_fee_idr' => $this->transfer->platform_fee_idr,
            'net_proceeds_idr' => $this->listing->net_proceeds_idr,
        ];
    }
}
