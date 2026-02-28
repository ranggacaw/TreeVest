<?php

namespace App\Http\Requests;

use App\Enums\RiskRating;
use App\Enums\TreeLifecycleStage;
use Illuminate\Foundation\Http\FormRequest;

class StoreTreeRequest extends FormRequest
{
    public function authorize(): bool
    {
        $fruitCrop = \App\Models\FruitCrop::find($this->input('fruit_crop_id'));
        
        return $fruitCrop && $fruitCrop->farm->owner_id === $this->user()->id;
    }

    public function rules(): array
    {
        return [
            'fruit_crop_id' => 'required|exists:fruit_crops,id',
            'tree_identifier' => 'required|max:50',
            'age_years' => 'required|integer|min:0|max:100',
            'productive_lifespan_years' => 'required|integer|min:0',
            'risk_rating' => 'required|in:' . implode(',', array_column(RiskRating::cases(), 'value')),
            'min_investment_cents' => 'required|integer|min:1',
            'max_investment_cents' => 'required|integer|gte:min_investment_cents',
            'status' => 'required|in:' . implode(',', array_column(TreeLifecycleStage::cases(), 'value')),
            'pricing_config' => 'required|array',
            'pricing_config.base_price' => 'required|integer|min:1',
            'pricing_config.age_coefficient' => 'required|numeric|min:0',
            'pricing_config.crop_premium' => 'required|numeric|min:0',
            'pricing_config.risk_multiplier' => 'required|numeric|min:1',
        ];
    }
}
