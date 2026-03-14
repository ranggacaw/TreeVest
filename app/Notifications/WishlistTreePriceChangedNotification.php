<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\Tree;

class WishlistTreePriceChangedNotification extends BaseNotification
{
    public function __construct(Tree $tree, int $oldPriceIdr, int $newPriceIdr)
    {
        $direction = $newPriceIdr < $oldPriceIdr ? 'decreased' : 'increased';

        parent::__construct([
            'tree_id' => $tree->id,
            'tree_identifier' => $tree->tree_identifier,
            'fruit_type' => $tree->fruitCrop?->fruitType?->name,
            'variant' => $tree->fruitCrop?->variant,
            'farm_name' => $tree->fruitCrop?->farm?->name,
            'old_price_idr' => $oldPriceIdr,
            'new_price_idr' => $newPriceIdr,
            'price_direction' => $direction,
            'tree_url' => route('trees.show', $tree->id),
        ]);
    }

    protected function getNotificationType(): NotificationType
    {
        return NotificationType::Market;
    }

    protected function getDefaultSubject(): string
    {
        $identifier = $this->data['tree_identifier'] ?? 'Tree';
        $direction = $this->data['price_direction'] ?? 'changed';

        return "Price {$direction} for your wishlisted tree #{$identifier}";
    }

    protected function getDefaultBody(): string
    {
        $type = $this->data['fruit_type'] ?? 'Tree';
        $variant = $this->data['variant'] ?? '';
        $oldPrice = number_format($this->data['old_price_idr'], 0, ',', '.');
        $newPrice = number_format($this->data['new_price_idr'], 0, ',', '.');
        $direction = $this->data['price_direction'] ?? 'changed';

        return "{$type} {$variant} price has {$direction} from Rp {$oldPrice} to Rp {$newPrice}.";
    }

    protected function getIcon(): string
    {
        return $this->data['price_direction'] === 'decreased' ? '📉' : '📈';
    }

    protected function getActionUrl(): ?string
    {
        return $this->data['tree_url'] ?? null;
    }
}
