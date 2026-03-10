<?php

namespace App\Http\Requests;

use App\Enums\AgrotourismEventType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAgrotourismEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Farm ownership is validated in the controller before calling this request
        return true;
    }

    public function rules(): array
    {
        return [
            'title'          => ['required', 'string', 'max:255'],
            'description'    => ['required', 'string'],
            'event_date'     => ['required', 'date', 'after:now'],
            'event_type'     => ['required', Rule::in(array_column(AgrotourismEventType::cases(), 'value'))],
            'max_capacity'   => ['nullable', 'integer', 'min:1'],
            'location_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
