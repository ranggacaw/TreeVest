<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReportFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'farm_id' => ['nullable', 'integer', Rule::exists('farms', 'id')],
            'fruit_type_id' => ['nullable', 'integer', Rule::exists('fruit_types', 'id')],
            'investment_id' => ['nullable', 'integer', Rule::exists('investments', 'id')->where('user_id', $this->user()->id)],
        ];
    }

    public function messages(): array
    {
        return [
            'to.after_or_equal' => 'The end date must be after or equal to the start date.',
            'investment_id.exists' => 'The selected investment does not exist or does not belong to you.',
        ];
    }
}
