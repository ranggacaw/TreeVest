<?php

namespace App\Http\Requests\FarmOwner;

use Illuminate\Foundation\Http\FormRequest;

class RecordYieldRequest extends FormRequest
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
            'actual_yield_kg' => ['required', 'numeric', 'min:0'],
            'quality_grade' => ['required', 'in:A,B,C'],
            'notes' => ['nullable', 'string'],
        ];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
        ];
    }
}
