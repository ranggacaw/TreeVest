<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class PhoneLoginRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string'],
        ];
    }
}
