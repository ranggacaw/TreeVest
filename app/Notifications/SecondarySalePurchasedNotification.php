<?php

namespace App\Notifications;

use App\Models\InvestmentTransfer;
use App\Models\MarketListing;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SecondarySalePurchasedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public MarketListing $listing,
        public InvestmentTransfer $transfer,
        public User $seller
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
            ->subject('Investment Purchase Successful!')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Congratulations! You have successfully purchased an investment on the secondary market.')
            ->line('**Investment:** Tree #'.$this->listing->investment->tree->identifier)
            ->line('**Purchase Price:** '.$this->listing->formatted_ask_price)
            ->line('**Fruit Type:** '.$this->listing->investment->tree->fruitType->name)
            ->line('**Farm:** '.$this->listing->investment->tree->fruitCrop->farm->name)
            ->action('View Your Investment', url('/investments/'.$this->listing->investment_id))
            ->line('All future harvest payouts will be credited to your account. Thank you for investing with Treevest!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'listing_id' => $this->listing->id,
            'investment_id' => $this->listing->investment_id,
            'seller_id' => $this->seller->id,
            'transfer_price_idr' => $this->transfer->transfer_price_idr,
        ];
    }
}
