<?php

namespace Tests\Feature;

use App\Jobs\DeleteUserData;
use App\Jobs\ExportUserData;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class GdprComplianceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_request_data_export()
    {
        Queue::fake();

        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post('/account/data-export');
        $response->assertRedirect();

        Queue::assertPushed(ExportUserData::class);
    }

    public function test_user_can_request_deletion()
    {
        Queue::fake();

        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post('/account/delete', [
            'password' => 'password', // Assumes factory password is 'password'
        ]);

        $response->assertRedirect('/');

        Queue::assertPushed(DeleteUserData::class);
    }
}
