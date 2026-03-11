<?php

namespace Tests\Feature;

use Tests\TestCase;

class I18nTranslationParityTest extends TestCase
{
    public function test_id_translations_have_parity_with_en()
    {
        $enPath = public_path('locales/en');
        $idPath = public_path('locales/id');

        if (! is_dir($enPath) || ! is_dir($idPath)) {
            $this->markTestSkipped('Translation directories do not exist.');
        }

        $enFiles = glob($enPath.'/*.json');

        foreach ($enFiles as $file) {
            $filename = basename($file);
            $idFile = $idPath.'/'.$filename;

            $this->assertFileExists($idFile);

            $enData = json_decode(file_get_contents($file), true);
            $idData = json_decode(file_get_contents($idFile), true);

            foreach (array_keys($enData) as $key) {
                $this->assertArrayHasKey($key, $idData, "Missing translation key {$key} in {$idFile}");
            }
        }
    }
}
