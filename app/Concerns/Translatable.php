<?php

namespace App\Concerns;

use App\Models\ContentTranslation;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Translatable
{
    /**
     * Get all the model's translations.
     */
    public function translations(): MorphMany
    {
        return $this->morphMany(ContentTranslation::class, 'translatable');
    }

    /**
     * Boot the trait to listen for model updates.
     */
    protected static function bootTranslatable(): void
    {
        static::updated(function ($model) {
            $translatableFields = property_exists($model, 'translatable') ? $model->translatable : [];

            foreach ($translatableFields as $field) {
                if ($model->wasChanged($field)) {
                    $model->translations()
                        ->where('field', $field)
                        ->update(['status' => 'under_review']);
                }
            }
        });
    }

    /**
     * Get a specific translation.
     */
    public function getTranslation(string $field, string $locale): ?string
    {
        $translation = $this->translations()
            ->where('field', $field)
            ->where('locale', $locale)
            ->first();

        return $translation?->value;
    }

    /**
     * Set a specific translation.
     */
    public function setTranslation(
        string $field,
        string $locale,
        string $value,
        string $source = 'human',
        string $status = 'draft'
    ): void {
        $this->translations()->updateOrCreate(
            ['field' => $field, 'locale' => $locale],
            [
                'value' => $value,
                'source' => $source,
                'status' => $status,
            ]
        );
    }

    /**
     * Get the translated attribute or fallback to the original if not found or if the locale is default.
     */
    public function translatedAttribute(string $field): ?string
    {
        $currentLocale = app()->getLocale();
        $defaultLocale = config('locales.default', 'en');

        // If the requested locale is the default locale, return the original attribute
        if ($currentLocale === $defaultLocale) {
            return $this->getAttribute($field);
        }

        // We load the translation if we haven't already
        // Optional optimization: check if translations are loaded in relation
        if ($this->relationLoaded('translations')) {
            $translation = $this->translations
                ->where('field', $field)
                ->where('locale', $currentLocale)
                ->where('status', 'approved')
                ->first();

            if ($translation) {
                return $translation->value;
            }
        } else {
            // Direct query if not loaded
            $translation = $this->translations()
                ->where('field', $field)
                ->where('locale', $currentLocale)
                ->where('status', 'approved')
                ->first();

            if ($translation) {
                return $translation->value;
            }
        }

        // Fallback to the original model attribute if no approved translation is found
        return $this->getAttribute($field);
    }
}
