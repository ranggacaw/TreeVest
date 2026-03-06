<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Farm;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TranslatableTraitTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_and_set_translation()
    {
        $farm = Farm::factory()->create();

        $farm->setTranslation('description', 'id', 'Deskripsi pertanian ini.', 'user', 'approved');

        $translation = $farm->getTranslation('description', 'id');

        $this->assertEquals('Deskripsi pertanian ini.', $translation->value);
        $this->assertEquals('approved', $translation->status);
    }

    public function test_translated_attribute()
    {
        $farm = Farm::factory()->create(['description' => 'Original English description']);

        $this->assertEquals('Original English description', $farm->translatedAttribute('description', 'id'));

        $farm->setTranslation('description', 'id', 'Deskripsi pertanian', 'human', 'approved');

        $this->assertEquals('Deskripsi pertanian', $farm->translatedAttribute('description', 'id'));
    }
}
