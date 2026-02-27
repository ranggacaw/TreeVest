<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\GdprExportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GdprExportServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_exports_user_data()
    {
        $user = User::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
        ]);

        $service = new GdprExportService();
        $data = $service->exportUserData($user->id);

        $this->assertEquals('John Doe', $data['user_profile']['name']);
        $this->assertEquals('john@example.com', $data['user_profile']['email']);
        $this->assertArrayHasKey('exported_at', $data);
    }
}
