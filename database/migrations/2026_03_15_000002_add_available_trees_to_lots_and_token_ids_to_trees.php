<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1.2 Add available_trees column to lots
        Schema::table('lots', function (Blueprint $table) {
            $table->unsignedInteger('available_trees')->default(0)->after('total_trees');
        });

        // 1.3 Backfill available_trees = total_trees for existing lots
        DB::statement('UPDATE lots SET available_trees = total_trees WHERE deleted_at IS NULL');
        DB::statement('UPDATE lots SET available_trees = total_trees WHERE deleted_at IS NOT NULL');

        // 1.4 Generate token_id for existing trees: TRX-{lot_id_padded_5}-{row_number_padded_3 within lot}
        // We derive tree_number from the row_number ordered by id within each lot
        $trees = DB::table('trees')
            ->whereNull('deleted_at')
            ->whereNull('token_id')
            ->orderBy('lot_id')
            ->orderBy('id')
            ->get(['id', 'lot_id']);

        $lotCounters = [];
        foreach ($trees as $tree) {
            $lotId = $tree->lot_id ?? 0;
            $lotCounters[$lotId] = ($lotCounters[$lotId] ?? 0) + 1;
            $tokenId = sprintf('TRX-%05d-%03d', $lotId, $lotCounters[$lotId]);
            DB::table('trees')->where('id', $tree->id)->update(['token_id' => $tokenId]);
        }
    }

    public function down(): void
    {
        Schema::table('lots', function (Blueprint $table) {
            $table->dropColumn('available_trees');
        });
    }
};
