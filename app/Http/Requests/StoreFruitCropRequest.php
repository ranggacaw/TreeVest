<?php

namespace App\Http\Requests;

use App\Enums\HarvestCycle;
use Illuminate\Foundation\Http\FormRequest;

class StoreFruitCropRequest extends FormRequest
{
    public function authorize(): bool
    {
        $farmId = $this->input('farm_id');
        $farm = \App\Models\Farm::find($farmId);

        return $farm && $farm->owner_id === $this->user()->id;
    }

    public function rules(): array
    {
        return [
            'farm_id' => 'required|exists:farms,id',
            'fruit_type_id' => 'required|exists:fruit_types,id',
            'variant' => 'required|max:100',
            'harvest_cycle' => 'required|in:' . implode(',', array_column(HarvestCycle::cases(), 'value')),
            'planted_date' => 'nullable|date',
            'description' => 'nullable|max:1000',
        ];
    }
}
