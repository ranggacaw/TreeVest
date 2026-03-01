<?php

namespace App\Http\Requests;

use App\Models\Tree;
use Illuminate\Foundation\Http\FormRequest;

class StoreInvestmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $treeId = $this->input('tree_id');
        $tree = $treeId ? Tree::find($treeId) : null;

        $minInvestment = $tree?->min_investment_cents ?? 1;
        $maxInvestment = $tree?->max_investment_cents ?? 999999999;

        return [
            'tree_id' => 'required|exists:trees,id',
            'amount_cents' => [
                'required',
                'integer',
                "min:{$minInvestment}",
                "max:{$maxInvestment}",
            ],
            'acceptance_risk_disclosure' => 'required|boolean|accepted',
            'acceptance_terms' => 'required|boolean|accepted',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
        ];
    }

    public function messages(): array
    {
        return [
            'amount_cents.min' => 'The investment amount is below the minimum allowed for this tree.',
            'amount_cents.max' => 'The investment amount exceeds the maximum allowed for this tree.',
            'acceptance_risk_disclosure.required' => 'You must accept the risk disclosure to proceed.',
            'acceptance_risk_disclosure.accepted' => 'You must accept the risk disclosure to proceed.',
            'acceptance_terms.required' => 'You must accept the terms and conditions to proceed.',
            'acceptance_terms.accepted' => 'You must accept the terms and conditions to proceed.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $tree = Tree::find($this->input('tree_id'));

            if ($tree && ! $tree->isInvestable()) {
                $validator->errors()->add('tree_id', 'This tree is not currently available for investment.');
            }
        });
    }
}
