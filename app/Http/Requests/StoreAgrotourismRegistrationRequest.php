<?php

namespace App\Http\Requests;

use App\Enums\AgrotourismEventType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAgrotourismRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // auth middleware handles authentication
    }

    public function rules(): array
    {
        return [
            'registration_type' => [
                'required',
                Rule::in([
                    AgrotourismEventType::Online->value,
                    AgrotourismEventType::Offline->value,
                ]),
            ],
        ];
    }
}
