<?php

namespace App\Listeners;

use App\Enums\AuditEventType;
use App\Events\FruitCropCreated;
use App\Events\FruitCropDeleted;
use App\Events\FruitCropUpdated;
use App\Events\TreeCreated;
use App\Events\TreeDeleted;
use App\Events\TreeStatusChanged;
use App\Events\TreeUpdated;
use App\Models\AuditLog;
use Illuminate\Events\Dispatcher;

class TreeCatalogEventSubscriber
{
    protected function logEvent(AuditEventType $type, array $data): void
    {
        if (! auth()->check()) {
            return;
        }

        AuditLog::create([
            'user_id' => auth()->id(),
            'event_type' => $type,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'event_data' => $data,
            'created_at' => now(),
        ]);
    }

    public function handleFruitCropCreated(FruitCropCreated $event): void
    {
        $this->logEvent(AuditEventType::FRUIT_CROP_CREATED, [
            'fruit_crop_id' => $event->fruitCrop->id,
            'farm_id' => $event->fruitCrop->farm_id,
            'variant' => $event->fruitCrop->variant,
        ]);
    }

    public function handleFruitCropUpdated(FruitCropUpdated $event): void
    {
        $this->logEvent(AuditEventType::FRUIT_CROP_UPDATED, [
            'fruit_crop_id' => $event->fruitCrop->id,
            'farm_id' => $event->fruitCrop->farm_id,
            'changes' => $event->fruitCrop->getChanges(),
        ]);
    }

    public function handleFruitCropDeleted(FruitCropDeleted $event): void
    {
        $this->logEvent(AuditEventType::FRUIT_CROP_DELETED, [
            'fruit_crop_id' => $event->fruitCrop->id,
            'farm_id' => $event->fruitCrop->farm_id,
        ]);
    }

    public function handleTreeCreated(TreeCreated $event): void
    {
        $this->logEvent(AuditEventType::TREE_CREATED, [
            'tree_id' => $event->tree->id,
            'fruit_crop_id' => $event->tree->fruit_crop_id,
            'tree_identifier' => $event->tree->tree_identifier,
        ]);
    }

    public function handleTreeUpdated(TreeUpdated $event): void
    {
        $this->logEvent(AuditEventType::TREE_UPDATED, [
            'tree_id' => $event->tree->id,
            'fruit_crop_id' => $event->tree->fruit_crop_id,
            'changes' => $event->tree->getChanges(),
        ]);
    }

    public function handleTreeDeleted(TreeDeleted $event): void
    {
        $this->logEvent(AuditEventType::TREE_DELETED, [
            'tree_id' => $event->tree->id,
            'fruit_crop_id' => $event->tree->fruit_crop_id,
        ]);
    }

    public function handleTreeStatusChanged(TreeStatusChanged $event): void
    {
        $this->logEvent(AuditEventType::TREE_STATUS_CHANGED, [
            'tree_id' => $event->tree->id,
            'old_status' => $event->oldStatus,
            'new_status' => $event->newStatus,
        ]);
    }

    public function subscribe(Dispatcher $events): array
    {
        return [
            FruitCropCreated::class => 'handleFruitCropCreated',
            FruitCropUpdated::class => 'handleFruitCropUpdated',
            FruitCropDeleted::class => 'handleFruitCropDeleted',
            TreeCreated::class => 'handleTreeCreated',
            TreeUpdated::class => 'handleTreeUpdated',
            TreeDeleted::class => 'handleTreeDeleted',
            TreeStatusChanged::class => 'handleTreeStatusChanged',
        ];
    }
}
