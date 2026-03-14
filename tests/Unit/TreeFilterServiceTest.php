<?php

namespace Tests\Unit;

use App\Models\Tree;
use App\Services\TreeFilterService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TreeFilterServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_apply_filters()
    {
        $service = new TreeFilterService;

        $query = Tree::query();

        $filters = [
            'risk_rating' => ['low'],
            'price_min' => 0,
            'price_max' => 50000,
        ];

        $query = $service->applyFilters($query, $filters);

        $sql = $query->toSql();
        // SQLite uses double quotes, MySQL uses backtick quoting
        $quoteChar = in_array(config('database.default'), ['sqlite', 'mysql']) ?
            (config('database.default') === 'mysql' ? '`' : '"') : '"';
        $this->assertStringContainsString($quoteChar.'risk_rating'.$quoteChar, $sql);
        $this->assertStringContainsString($quoteChar.'price_idr'.$quoteChar, $sql);
        $this->assertStringContainsString('between', $sql);
    }
}
