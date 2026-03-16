<?php

namespace App\Http\Resources;

use App\Models\TreeHealthUpdate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HealthUpdateResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var TreeHealthUpdate $this */
        return [
            'id' => $this->id,
            'fruit_crop_id' => $this->fruit_crop_id,
            'severity' => $this->severity->value,
            'update_type' => $this->update_type->value,
            'title' => $this->title,
            'description' => $this->description,
            'visibility' => $this->visibility,
            'photos' => $this->getPhotoUrls(),
            'thumbnail_urls' => $this->getThumbnailUrls(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'fruit_crop' => [
                'id' => $this->fruitCrop?->id,
                'variant' => $this->fruitCrop?->variant,
                'fruit_type' => [
                    'id' => $this->fruitCrop?->fruitType?->id,
                    'name' => $this->fruitCrop?->fruitType?->name,
                ],
                'farm' => [
                    'id' => $this->fruitCrop?->farm?->id,
                    'name' => $this->fruitCrop?->farm?->name,
                ],
            ],
            'author' => [
                'id' => $this->author?->id,
                'name' => $this->author?->name,
            ],
        ];
    }
}
