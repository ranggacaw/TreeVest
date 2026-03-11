<?php

namespace App\Http\Requests;

use App\Enums\AgrotourismEventType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAgrotourismEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var \App\Models\AgrotourismEvent|null $event */
        $event = $this->route('event');

        if (! $event) {
            return false;
        }

        return $event->farm->owner_id === $this->user()->id;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'event_date' => ['sometimes', 'date', 'after:now'],
            'event_type' => ['sometimes', Rule::in(array_column(AgrotourismEventType::cases(), 'value'))],
            'max_capacity' => ['nullable', 'integer', 'min:1'],
            'location_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
