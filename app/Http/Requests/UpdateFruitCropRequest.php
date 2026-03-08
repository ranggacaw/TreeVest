<?php

namespace App\Http\Requests;

class UpdateFruitCropRequest extends StoreFruitCropRequest
{
    public function authorize(): bool
    {
        $fruitCrop = $this->route('fruitCrop');

        if (is_string($fruitCrop)) {
            $fruitCrop = \App\Models\FruitCrop::find($fruitCrop);
        }

        return $fruitCrop && $fruitCrop->farm->owner_id === $this->user()->id;
    }
}
