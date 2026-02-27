<?php

namespace Tests\Feature;

use App\Models\LegalDocument;
use App\Models\User;
use App\Enums\LegalDocumentType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\LegalDocumentService;
use Tests\TestCase;

class LegalDocumentTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_legal_document()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        LegalDocument::create([
            'type' => LegalDocumentType::PRIVACY_POLICY,
            'version' => '1.0',
            'title' => 'Privacy Policy',
            'content' => 'Content',
            'effective_date' => now(),
            'is_active' => true,
        ]);

        $response = $this->get('/legal/privacy');
        $response->assertStatus(200);
    }

    public function test_user_can_accept_legal_document()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $document = LegalDocument::create([
            'type' => LegalDocumentType::TERMS_OF_SERVICE,
            'version' => '1.0',
            'title' => 'Terms of Service',
            'content' => 'Content',
            'effective_date' => now(),
            'is_active' => true,
        ]);

        $response = $this->post("/legal/accept/terms_of_service");
        $response->assertRedirect();
        
        $this->assertDatabaseHas('user_document_acceptances', [
            'user_id' => $user->id,
            'legal_document_id' => $document->id,
        ]);
    }
}
