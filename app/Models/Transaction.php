<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected function casts(): array
    {
        return [
            'amount' => 'encrypted',
            'account_number' => 'encrypted',
        ];
    }
}
