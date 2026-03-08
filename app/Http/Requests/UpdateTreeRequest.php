<?php

namespace App\Http\Requests;

class UpdateTreeRequest extends StoreTreeRequest
{
    public function authorize(): bool
    {
        $tree = $this->route('tree');

        return $tree && $tree->fruitCrop->farm->owner_id === $this->user()->id;
    }
}
