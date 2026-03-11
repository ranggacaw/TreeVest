<?php

namespace Tests\Unit;

use App\Services\Translation\GoogleTranslationService;
use Tests\TestCase;

class TranslationServiceTest extends TestCase
{
    public function test_translate_method()
    {
        $service = new GoogleTranslationService;

        // Mock translate implementation (since it returns "[id] text" currently)
        $result = $service->translate('Hello', 'en', 'id');

        $this->assertStringContainsString('Hello', $result);
        $this->assertStringContainsString('[id]', $result);
    }

    public function test_translate_array()
    {
        $service = new GoogleTranslationService;

        $result = $service->translate(['Hello', 'World'], 'en', 'id');

        $this->assertIsArray($result);
        $this->assertCount(2, $result);
        $this->assertStringContainsString('Hello', $result[0]);
    }
}
