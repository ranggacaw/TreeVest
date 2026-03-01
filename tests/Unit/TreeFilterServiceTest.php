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
        $this->assertStringContainsString('"risk_rating" in (?)', $sql);
        $this->assertStringContainsString('"price_cents" between ? and ?', $sql);
    }
}
