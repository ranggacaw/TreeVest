<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class EnableTwoFactorRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:totp,sms'],
            'password' => ['required', 'current_password'],
        ];
    }
}
