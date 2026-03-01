<?php

namespace App\Enums;

enum QualityGrade: string
{
    case A = 'A';
    case B = 'B';
    case C = 'C';

    public function label(): string
    {
        return match ($this) {
            self::A => 'Grade A',
            self::B => 'Grade B',
            self::C => 'Grade C',
        };
    }
}
