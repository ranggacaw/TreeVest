<?php

namespace Tests\Feature\Profile;

use App\Models\PhoneVerification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_profile_name()
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user)
            ->patch('/profile', [
                'name' => 'New Name',
                'email' => $user->email,
            ]);

        $response->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertEquals('New Name', $user->name);
    }

    public function test_user_can_add_phone_number_with_verification()
    {
        $user = User::factory()->create(['phone' => null]);

        PhoneVerification::create([
            'phone' => '+60123456789',
            'code' => bcrypt('123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->actingAs($user)
            ->post('/profile/phone/verify', [
                'phone' => '+60123456789',
                'code' => '123456',
            ]);

        $response->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertEquals('+60123456789', $user->phone);
        $this->assertNotNull($user->phone_verified_at);
    }

    public function test_user_can_upload_avatar()
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $file = UploadedFile::fake()->image('avatar.jpg', 800, 800);

        $response = $this->actingAs($user)
            ->post('/profile/avatar', [
                'avatar' => $file,
            ]);

        $response->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertNotNull($user->avatar_url);

        Storage::disk('public')->assertExists($user->avatar_url);
    }

    public function test_avatar_upload_validates_file_size()
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $file = UploadedFile::fake()->create('avatar.jpg', 5000);

        $response = $this->actingAs($user)
            ->post('/profile/avatar', [
                'avatar' => $file,
            ]);

        $response->assertSessionHasErrors();
    }

    public function test_avatar_upload_validates_mime_type()
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $file = UploadedFile::fake()->create('avatar.gif', 100);

        $response = $this->actingAs($user)
            ->post('/profile/avatar', [
                'avatar' => $file,
            ]);

        $response->assertSessionHasErrors();
    }

    public function test_user_can_delete_avatar()
    {
        Storage::fake('public');

        $user = User::factory()->create(['avatar_url' => 'avatars/1/avatar.jpg']);
        Storage::disk('public')->put('avatars/1/avatar.jpg', 'content');

        $response = $this->actingAs($user)
            ->delete('/profile/avatar');

        $response->assertStatus(200);

        $user->refresh();
        $this->assertNull($user->avatar_url);

        Storage::disk('public')->assertMissing('avatars/1/avatar.jpg');
    }

    public function test_user_can_view_profile_page()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->get('/profile');

        $response->assertStatus(200);
    }

    public function test_phone_number_update_requires_re_verification()
    {
        $user = User::factory()->create(['phone' => '+60123456789']);

        $response = $this->actingAs($user)
            ->post('/profile/phone/update', [
                'phone' => '+60987654321',
            ]);

        $response->assertRedirect(route('profile.phone.verify'));
    }

    public function test_email_update_requires_new_verification()
    {
        $user = User::factory()->create(['email' => 'old@example.com']);

        $response = $this->actingAs($user)
            ->patch('/profile', [
                'name' => $user->name,
                'email' => 'new@example.com',
            ]);

        $this->assertNull($user->fresh()->email_verified_at);
    }
}
