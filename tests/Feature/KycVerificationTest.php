<?php

namespace Tests\Feature;

use App\Enums\KycDocumentType;
use App\Enums\KycStatus;
use App\Models\KycDocument;
use App\Models\KycVerification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KycVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Storage::fake('kyc_documents');
    }

    public function test_user_can_view_kyc_index()
    {
        $response = $this->actingAs($this->user)
            ->get('/profile/kyc');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Profile/KycVerification/Index')
        );
    }

    public function test_user_can_view_kyc_upload_page()
    {
        $response = $this->actingAs($this->user)
            ->get('/profile/kyc/upload');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Profile/KycVerification/Upload')
        );
    }

    public function test_user_can_upload_document()
    {
        Notification::fake();

        $file = UploadedFile::fake()->image('passport.jpg', 1024, 1024)->size(500);

        $response = $this->actingAs($this->user)
            ->post('/profile/kyc/documents', [
                'document_type' => 'passport',
                'document' => $file,
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('kyc_documents', [
            'kyc_verification_id' => $this->user->kycVerifications()->latest()->first()?->id,
            'document_type' => KycDocumentType::PASSPORT,
        ]);
    }

    public function test_upload_rejects_invalid_file_type()
    {
        $file = UploadedFile::fake()->create('document.exe', 1024);

        $response = $this->actingAs($this->user)
            ->post('/profile/kyc/documents', [
                'document_type' => 'passport',
                'document' => $file,
            ]);

        $response->assertSessionHasErrors('document');
    }

    public function test_upload_rejects_file_too_large()
    {
        $file = UploadedFile::fake()->image('passport.jpg', 1024, 1024)->size(20000);

        $response = $this->actingAs($this->user)
            ->post('/profile/kyc/documents', [
                'document_type' => 'passport',
                'document' => $file,
            ]);

        $response->assertSessionHasErrors('document');
    }

    public function test_user_can_submit_kyc_for_review()
    {
        Notification::fake();

        $verification = KycVerification::factory()->create([
            'user_id' => $this->user->id,
            'status' => KycStatus::PENDING,
        ]);

        KycDocument::factory()->create([
            'kyc_verification_id' => $verification->id,
            'document_type' => KycDocumentType::PASSPORT,
        ]);
        KycDocument::factory()->create([
            'kyc_verification_id' => $verification->id,
            'document_type' => KycDocumentType::PROOF_OF_ADDRESS,
        ]);

        $response = $this->actingAs($this->user)
            ->post('/profile/kyc/submit');

        $response->assertRedirect();
        $this->assertEquals(KycStatus::SUBMITTED, $verification->refresh()->status);
    }

    public function test_submit_fails_without_required_documents()
    {
        $verification = KycVerification::factory()->create([
            'user_id' => $this->user->id,
            'status' => KycStatus::PENDING,
        ]);

        $response = $this->actingAs($this->user)
            ->post('/profile/kyc/submit');

        $response->assertSessionHasErrors();
    }

    public function test_user_can_view_own_documents()
    {
        $verification = KycVerification::factory()->create([
            'user_id' => $this->user->id,
            'status' => KycStatus::PENDING,
        ]);

        $document = KycDocument::factory()->create([
            'kyc_verification_id' => $verification->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/profile/kyc/documents/'.$document->id);

        $response->assertStatus(200);
    }

    public function test_user_cannot_view_others_documents()
    {
        $otherUser = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $otherUser->id,
            'status' => KycStatus::PENDING,
        ]);

        $document = KycDocument::factory()->create([
            'kyc_verification_id' => $verification->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get('/profile/kyc/documents/'.$document->id);

        $response->assertStatus(403);
    }

    public function test_guest_cannot_access_kyc_routes()
    {
        $response = $this->get('/profile/kyc');

        $response->assertRedirect('/login');
    }
}
