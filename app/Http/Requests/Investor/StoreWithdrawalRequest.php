<?php

namespace App\Http\Requests\Investor;

use Illuminate\Foundation\Http\FormRequest;

class StoreWithdrawalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Auth guard enforced via route middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount_cents' => ['required', 'integer', 'min:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount_cents.min' => 'Minimum withdrawal amount is Rp 10.00 (1,000 cents).',
        ];
    }
}
