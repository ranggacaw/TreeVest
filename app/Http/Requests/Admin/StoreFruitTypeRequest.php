<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreFruitTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:fruit_types,slug'],
            'description' => ['nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required.',
            'slug.unique' => 'This slug is already in use.',
            'is_active.required' => 'Active status is required.',
        ];
    }
}
