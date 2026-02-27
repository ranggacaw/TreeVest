<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = ['user_id', 'amount', 'account_number'];

    protected function casts(): array
    {
        return [
            'amount' => 'encrypted',
            'account_number' => 'encrypted',
        ];
    }
}
