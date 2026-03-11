<?php

namespace App\Services\Translation;

interface TranslationServiceInterface
{
    /**
     * Translate text from a source language to a target language.
     *
     * @param  string|array  $text  The text or array of texts to translate.
     * @param  string  $sourceLanguage  The source language code (e.g., 'en').
     * @param  string  $targetLanguage  The target language code (e.g., 'id').
     * @param  string  $format  The text format ('text' or 'html').
     * @return string|array The translated text or array of translated texts.
     */
    public function translate($text, string $sourceLanguage, string $targetLanguage, string $format = 'text');
}
