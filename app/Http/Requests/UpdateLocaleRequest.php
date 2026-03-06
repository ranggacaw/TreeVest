<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\In;

class UpdateLocaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $availableLocales = array_keys(config('locales.supported', []));

        return [
            'locale' => ['required', 'string', new In($availableLocales)],
        ];
    }
}
