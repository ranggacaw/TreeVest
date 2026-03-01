<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMarketListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasVerifiedKyc() ?? false;
    }

    public function rules(): array
    {
        return [
            'investment_id' => ['required', 'exists:investments,id'],
            'ask_price_cents' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ];
    }
}
