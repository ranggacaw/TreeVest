<?php

namespace App\Http\Requests\FarmOwner;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHarvestStatusRequest extends FormRequest
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
        $rules = [
            'notes' => ['nullable', 'string'],
        ];

        if ($this->input('action') === 'fail') {
            $rules['notes'][] = 'required';
        }

        return $rules;
    }
}
