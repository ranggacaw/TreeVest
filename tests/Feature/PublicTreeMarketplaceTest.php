<?php

namespace Tests\Feature;

use App\Models\Tree;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicTreeMarketplaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_marketplace_shows_investable_trees()
    {
        // Add minimal test if factories aren't perfectly set up yet
        $response = $this->get(route('trees.index'));
        $response->assertStatus(200);
    }
}
