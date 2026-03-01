<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PurchaseMarketListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasVerifiedKyc() ?? false;
    }

    public function rules(): array
    {
        return [
            'payment_method_id' => ['nullable', 'exists:payment_methods,id'],
        ];
    }
}
