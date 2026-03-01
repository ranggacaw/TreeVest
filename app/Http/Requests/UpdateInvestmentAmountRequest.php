<?php

namespace App\Http\Requests;

use App\Models\Investment;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInvestmentAmountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $investment = Investment::find($this->route('investment'));
        $maxInvestment = $investment?->tree?->max_investment_cents ?? 999999999;
        $currentAmount = $investment?->amount_cents ?? 0;
        $availableCapacity = $maxInvestment - $currentAmount;

        return [
            'top_up_cents' => [
                'required',
                'integer',
                'min:1',
                "max:{$availableCapacity}",
            ],
            'payment_method_id' => 'nullable|exists:payment_methods,id',
        ];
    }

    public function messages(): array
    {
        return [
            'top_up_cents.min' => 'Top-up amount must be at least 1 cent.',
            'top_up_cents.max' => 'Top-up amount exceeds the remaining investment capacity for this tree.',
        ];
    }
}
