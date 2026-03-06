<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class I18nPageRenderTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_pages_render_in_id_locale()
    {
        $response = $this->withSession(['locale' => 'id'])->get('/login');
        $response->assertStatus(200);

        $response = $this->withSession(['locale' => 'id'])->get('/register');
        $response->assertStatus(200);

        $response = $this->withSession(['locale' => 'id'])->get('/farms');
        $response->assertStatus(200);
    }
}
