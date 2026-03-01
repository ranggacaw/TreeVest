<?php

namespace App\Http\Requests;

class UpdateFruitCropRequest extends StoreFruitCropRequest
{
    public function authorize(): bool
    {
        $fruitCrop = \App\Models\FruitCrop::find($this->route('fruit_crop'));

        return $fruitCrop && $fruitCrop->farm->owner_id === $this->user()->id;
    }
}
