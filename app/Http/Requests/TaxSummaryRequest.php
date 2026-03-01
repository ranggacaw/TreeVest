<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TaxSummaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $currentYear = (int) date('Y');

        return [
            'year' => ['required', 'integer', Rule::between($currentYear - 10, $currentYear + 1)],
        ];
    }

    public function messages(): array
    {
        return [
            'year.required' => 'The year is required.',
            'year.integer' => 'The year must be a valid year.',
            'year.between' => 'The year must be between :min and :max.',
        ];
    }
}
