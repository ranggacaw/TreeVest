<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BaseRequest extends FormRequest
{
    /**
     * Sanitize input before validation.
     */
    protected function prepareForValidation(): void
    {
        $this->sanitizeInput();
    }

    /**
     * Sanitize all string inputs.
     */
    protected function sanitizeInput(): void
    {
        $input = $this->all();
        $sanitized = [];
        $excludedKeys = ['password', 'password_confirmation', 'current_password'];

        foreach ($input as $key => $value) {
            if (in_array($key, $excludedKeys, true)) {
                $sanitized[$key] = $value;
                continue;
            }

            if (is_string($value)) {
                $sanitized[$key] = strip_tags($value);
            } else {
                $sanitized[$key] = $value;
            }
        }

        $this->replace($sanitized);
    }
}
