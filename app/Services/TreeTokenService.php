<?php

namespace App\Services;

use App\Models\Lot;

class TreeTokenService
{
    /**
     * Generate a unique, human-readable token ID for a tree.
     *
     * Format: TRX-{lot_id zero-padded to 5 digits}-{tree_number zero-padded to 3 digits}
     * Example: TRX-00001-012
     *
     * @param  Lot  $lot        The lot this tree belongs to.
     * @param  int  $treeNumber 1-based position of the tree within the lot.
     */
    public function generateTokenId(Lot $lot, int $treeNumber): string
    {
        return sprintf('TRX-%05d-%03d', $lot->id, $treeNumber);
    }
}
