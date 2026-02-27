<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SafeFilename implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return; // Only validate strings (filenames)
        }

        // Check for directory traversal or invalid characters
        if (preg_match('/\.\.|\/|\\\|:/', $value)) {
            $fail('The :attribute must be a safe filename without directory traversal characters.');
        }

        // Check for null bytes
        if (strpos($value, "\0") !== false) {
            $fail('The :attribute contains invalid characters.');
        }
    }
}
