<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class UploadAvatarRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'avatar' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ];
    }
}
