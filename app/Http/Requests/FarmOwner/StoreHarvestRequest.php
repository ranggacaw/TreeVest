<?php

namespace App\Http\Requests\FarmOwner;

use Illuminate\Foundation\Http\FormRequest;

class StoreHarvestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tree_id' => ['required', 'exists:trees,id'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
            'estimated_yield_kg' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }

}
