<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class PhoneRegisterRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'min:10', 'max:15'],
            'phone_country_code' => ['required', 'string', 'size:2'],
        ];
    }
}
