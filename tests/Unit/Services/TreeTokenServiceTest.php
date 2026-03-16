<?php

namespace Tests\Unit\Services;

use App\Models\Lot;
use App\Services\TreeTokenService;
use Tests\TestCase;

class TreeTokenServiceTest extends TestCase
{
    private TreeTokenService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TreeTokenService;
    }

    /** @test */
    public function it_generates_token_id_with_correct_format(): void
    {
        $lot = new Lot;
        $lot->id = 1;

        $token = $this->service->generateTokenId($lot, 12);

        $this->assertEquals('TRX-00001-012', $token);
    }

    /** @test */
    public function it_zero_pads_lot_id_to_five_digits(): void
    {
        $lot = new Lot;
        $lot->id = 42;

        $token = $this->service->generateTokenId($lot, 1);

        $this->assertEquals('TRX-00042-001', $token);
    }

    /** @test */
    public function it_zero_pads_tree_number_to_three_digits(): void
    {
        $lot = new Lot;
        $lot->id = 1;

        $token = $this->service->generateTokenId($lot, 7);

        $this->assertEquals('TRX-00001-007', $token);
    }

    /** @test */
    public function it_handles_large_lot_id(): void
    {
        $lot = new Lot;
        $lot->id = 99999;

        $token = $this->service->generateTokenId($lot, 999);

        $this->assertEquals('TRX-99999-999', $token);
    }

    /** @test */
    public function it_matches_expected_token_id_pattern(): void
    {
        $lot = new Lot;
        $lot->id = 3;

        $token = $this->service->generateTokenId($lot, 5);

        $this->assertMatchesRegularExpression('/^TRX-\d{5}-\d{3}$/', $token);
    }
}
