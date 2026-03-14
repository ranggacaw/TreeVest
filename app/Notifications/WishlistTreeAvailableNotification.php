<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\Tree;

class WishlistTreeAvailableNotification extends BaseNotification
{
    public function __construct(Tree $tree)
    {
        parent::__construct([
            'tree_id' => $tree->id,
            'tree_identifier' => $tree->tree_identifier,
            'fruit_type' => $tree->fruitCrop?->fruitType?->name,
            'variant' => $tree->fruitCrop?->variant,
            'farm_name' => $tree->fruitCrop?->farm?->name,
            'price_idr' => $tree->price_idr,
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

        return "Your wishlisted tree #{$identifier} is now available for investment";
    }

    protected function getDefaultBody(): string
    {
        $type = $this->data['fruit_type'] ?? 'Tree';
        $variant = $this->data['variant'] ?? '';
        $farm = $this->data['farm_name'] ?? '';

        return "{$type} {$variant} at {$farm} is now available. Invest today!";
    }

    protected function getIcon(): string
    {
        return '🌳';
    }

    protected function getActionUrl(): ?string
    {
        return $this->data['tree_url'] ?? null;
    }
}
