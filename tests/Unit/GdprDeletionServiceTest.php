<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\GdprDeletionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GdprDeletionServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_deletes_user_data()
    {
        $user = User::factory()->create();
        
        $service = new GdprDeletionService();
        $service->deleteUserData($user->id);

        $this->assertModelMissing($user);
    }
}
