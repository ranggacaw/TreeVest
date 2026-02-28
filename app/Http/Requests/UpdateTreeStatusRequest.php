<?php

namespace App\Http\Requests;

use App\Enums\TreeLifecycleStage;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTreeStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tree = \App\Models\Tree::find($this->route('tree'));
        
        return $tree && $tree->fruitCrop->farm->owner_id === $this->user()->id();
    }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'in:' . implode(',', array_column(TreeLifecycleStage::cases(), 'value')),
                function ($attribute, $value, $fail) {
                    $tree = $this->route('tree');
                    if ($tree && !$tree->canTransitionTo(TreeLifecycleStage::from($value))) {
                        $fail('Invalid status transition for current tree status.');
                    }
                },
            ],
        ];
    }
}
