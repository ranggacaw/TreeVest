<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['required', 'string', 'in:admin,investor,farm_owner'],
        ];
    }

    public function messages(): array
    {
        return [
            'role.in' => 'The selected role must be one of: admin, investor, farm_owner.',
        ];
    }
}
