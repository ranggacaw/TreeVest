<?php

namespace Tests\Feature;

use App\Models\FruitType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminFruitTypeTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_fruit_type()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        
        $response = $this->actingAs($admin)->post(route('admin.fruit-types.store'), [
            'name' => 'Apple',
            'slug' => 'apple',
            'description' => 'Apple trees',
            'is_active' => true,
        ]);
        
        $response->assertRedirect(route('admin.fruit-types.index'));
        $this->assertDatabaseHas('fruit_types', ['slug' => 'apple']);
    }
}
