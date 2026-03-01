<?php

namespace App\Http\Requests;

use App\Enums\HealthSeverity;
use App\Enums\HealthUpdateType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateHealthUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'severity' => ['sometimes', new Enum(HealthSeverity::class)],
            'update_type' => ['sometimes', new Enum(HealthUpdateType::class)],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'photos' => ['nullable', 'array', 'max:5'],
            'photos.*' => ['image', 'mimes:jpeg,png,webp', 'max:5120'],
            'visibility' => ['nullable', 'in:public,investors_only'],
        ];
    }

    public function messages(): array
    {
        return [
            'photos.max' => 'Maximum 5 photos allowed per health update.',
            'photos.*.max' => 'Each photo must be less than 5MB.',
            'photos.*.image' => 'Each file must be an image (JPEG, PNG, or WebP).',
        ];
    }
}
