<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NoSqlInjection implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        // Common SQL injection patterns
        $patterns = [
            '/(%27)|(\')|(--)|(%23)|(#)/i', // SQL comments and quotes
            '/(\b(select|union|insert|update|delete|drop|alter)\b)/i', // SQL keywords
            '/(\b(or|and)\b\s+(=|>|<|like|in|between|is|not)\s+)/i', // SQL logic
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $value)) {
                $fail('The :attribute contains potential SQL injection patterns.');

                return;
            }
        }
    }
}
