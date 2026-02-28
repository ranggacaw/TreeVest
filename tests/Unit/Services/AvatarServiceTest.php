<?php

namespace Tests\Unit\Services;

use App\Models\User;
use App\Services\AvatarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AvatarServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AvatarService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AvatarService;
        Storage::fake('public');
    }

    public function test_upload_avatar()
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg', 800, 800);

        $path = $this->service->upload($user, $file);

        $this->assertStringContainsString('avatars/'.$user->id, $path);
        $this->assertStringContainsString('.jpg', $path);

        $user->refresh();
        $this->assertEquals($path, $user->avatar_url);

        Storage::disk('public')->assertExists($path);
    }

    public function test_upload_validates_file_size()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Avatar file size must not exceed 2MB.');

        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('avatar.jpg', 5000);

        $this->service->upload($user, $file);
    }

    public function test_upload_validates_mime_type()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Avatar file must be JPEG, PNG, or WebP format.');

        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('avatar.gif', 100);

        $this->service->upload($user, $file);
    }

    public function test_upload_resizes_large_image()
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg', 2000, 2000);

        $path = $this->service->upload($user, $file);

        Storage::disk('public')->assertExists($path);

        $imageSize = getimagesize(Storage::disk('public')->path($path));
        $this->assertLessThanOrEqual(512, $imageSize[0]);
        $this->assertLessThanOrEqual(512, $imageSize[1]);
    }

    public function test_upload_deletes_old_avatar()
    {
        $user = User::factory()->create(['avatar_url' => 'avatars/1/old-avatar.jpg']);
        Storage::disk('public')->put('avatars/1/old-avatar.jpg', 'old content');

        $file = UploadedFile::fake()->image('new-avatar.jpg', 800, 800);

        $this->service->upload($user, $file);

        Storage::disk('public')->assertMissing('avatars/1/old-avatar.jpg');
    }

    public function test_delete_avatar()
    {
        $user = User::factory()->create(['avatar_url' => 'avatars/1/avatar.jpg']);
        Storage::disk('public')->put('avatars/1/avatar.jpg', 'content');

        $result = $this->service->delete($user);

        $this->assertTrue($result);

        $user->refresh();
        $this->assertNull($user->avatar_url);

        Storage::disk('public')->assertMissing('avatars/1/avatar.jpg');
    }

    public function test_delete_returns_false_when_no_avatar()
    {
        $user = User::factory()->create(['avatar_url' => null]);

        $result = $this->service->delete($user);

        $this->assertFalse($result);
    }

    public function test_get_public_url()
    {
        $path = 'avatars/1/avatar.jpg';

        $url = $this->service->getPublicUrl($path);

        $this->assertStringContainsString('avatars/1/avatar.jpg', $url);
    }

    public function test_upload_converts_to_jpeg()
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.png', 800, 800);

        $path = $this->service->upload($user, $file);

        $this->assertStringEndsWith('.jpg', $path);
    }

    public function test_upload_uses_correct_directory_structure()
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg', 800, 800);

        $path = $this->service->upload($user, $file);

        $this->assertMatchesRegularExpression('/^avatars\/'.$user->id.'\//', $path);
    }
}
