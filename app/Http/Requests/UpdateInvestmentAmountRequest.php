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
        $maxInvestment = $investment?->tree?->max_investment_idr ?? 99999999999;
        $currentAmount = $investment?->amount_idr ?? 0;
        $availableCapacity = $maxInvestment - $currentAmount;

        return [
            'top_up_idr' => [
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
            'top_up_idr.min' => 'Top-up amount must be at least Rp 1.',
            'top_up_idr.max' => 'Top-up amount exceeds the remaining investment capacity for this tree.',
        ];
    }
}
