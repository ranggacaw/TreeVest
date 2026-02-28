<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitKycVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'agreed_to_terms' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'agreed_to_terms.required' => 'You must agree to the terms and conditions.',
            'agreed_to_terms.accepted' => 'You must agree to the terms and conditions.',
        ];
    }
}
