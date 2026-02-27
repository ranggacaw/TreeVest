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
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'name' => 'Original Name',
        ]);

        $service = new GdprDeletionService;
        $service->deleteUserData($user->id);

        $this->assertSoftDeleted($user);

        $deletedUser = User::withTrashed()->find($user->id);
        $this->assertEquals('Deleted User', $deletedUser->name);
        $this->assertStringStartsWith('deleted_'.$user->id, $deletedUser->email);
        $this->assertNotEquals('test@example.com', $deletedUser->email);
    }
}
