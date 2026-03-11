<?php

namespace App\Http\Resources;

use App\Models\FruitCrop;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FruitCropResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var FruitCrop $this */
        return [
            'id' => $this->id,
            'variant' => $this->variant,
            'description' => $this->description,
            'harvest_cycle' => $this->harvest_cycle->value,
            'planted_date' => $this->planted_date?->toDateString(),
            'fruit_type' => [
                'id' => $this->fruitType?->id,
                'name' => $this->fruitType?->name,
                'slug' => $this->fruitType?->slug,
            ],
            'farm' => [
                'id' => $this->farm?->id,
                'name' => $this->farm?->name,
                'city' => $this->farm?->city,
                'state' => $this->farm?->state,
                'location' => $this->farm?->location ?? ($this->farm?->city.', '.$this->farm?->state),
            ],
        ];
    }

    /**
     * Basic fruit crop data
     */
    public static function basic($fruitCrop): array
    {
        if (! $fruitCrop) {
            return [];
        }

        return [
            'variant' => $fruitCrop->variant,
            'fruit_type' => $fruitCrop->fruitType?->name,
            'harvest_cycle' => $fruitCrop->harvest_cycle->value,
        ];
    }
}
