# Design: Full i18n Translation Coverage

## Context

The i18n infrastructure is fully operational — `SetLocale` middleware, `react-i18next`, `LanguageSwitcher`, `users.locale` column, and Inertia shared props all work correctly. However, coverage is near-zero: only 1 of 102 TSX page components uses `useTranslation()`, the EN/ID JSON files contain ~100 keys covering generic categories (auth, common, navigation, validation, errors, welcome, language), and no domain-specific namespaces exist for farms, investments, admin, or harvests.

This design covers four new architectural concerns that go beyond the existing "wrap strings in `t()`" work:

1. **Namespace strategy** — how to organize 500+ translation keys without namespace explosion
2. **Config-driven multi-locale architecture** — how to make adding a 3rd language trivial
3. **UGC translation data model** — how to store farm descriptions and articles in multiple languages
4. **Machine translation pipeline** — how to generate draft translations at scale with quality controls

## Goals / Non-Goals

**Goals:**

- 100% translation coverage of all user-facing static strings (EN and ID)
- Config-driven locale management — adding a new locale requires only config + translation files
- Translatable UGC for explicitly listed fields (farm descriptions, article title/content)
- Machine translation drafts with mandatory human review before publishing
- Admin UI for managing content translations and reviewing machine drafts

**Non-Goals:**

- Auto-translating all database text columns indiscriminately
- Real-time/live translation (all translations are pre-generated and stored)
- Translating user comments or tree names (these are proper nouns / user input)
- Building a full CMS for translation — this is a translation management UI, not a full TMS

## Decision 1: Namespace Strategy

**Choice:** Use 6 domain namespaces plus the existing `translation` (common) and `health` namespaces:

```
public/locales/{locale}/
  translation.json     # common strings (auth, nav, validation, errors, welcome) — EXISTING
  health.json          # health updates — EXISTING
  admin.json           # all admin panel strings
  farms.json           # farm listing, management, creation
  investments.json     # investment purchase, portfolio, payouts
  harvests.json        # harvest scheduling, yields, records
  education.json       # articles, encyclopedia
  auth.json            # auth pages (login, register, forgot password, 2FA)
```

**Why 8 namespaces (not 1 giant file or 30+ per-page files)?**

- `i18next-resources-to-backend` lazy-loads per namespace — each page only loads the 1-2 namespaces it needs
- 8 files is manageable for translators (1 file per domain concept)
- The epic recommends max 6-8 namespaces — 8 is within bounds
- Per-page files (e.g., `admin-dashboard.json`) would create 100+ network requests and maintenance chaos

**Namespace assignment:**

- Each page component declares its namespace(s): `useTranslation(['farms', 'translation'])`
- Shared components use only `translation` namespace (common strings)
- The `i18n.ts` config registers all namespaces but only the `translation` namespace is pre-loaded; others are lazy-loaded on demand

**Key naming convention:** Flat dot-separated keys within each namespace:

```json
{
    "index.title": "All Farms",
    "index.searchPlaceholder": "Search farms...",
    "show.harvestHistory": "Harvest History",
    "create.formTitle": "Create New Farm"
}
```

## Decision 2: Config-Driven Multi-Locale Architecture

**Choice:** Create `config/locales.php` as the single source of truth for all locale-related configuration. Everything else reads from it.

```php
// config/locales.php
return [
    'supported' => [
        'en' => [
            'name' => 'English',
            'native_name' => 'English',
            'flag' => '🇬🇧',
            'dir' => 'ltr',
        ],
        'id' => [
            'name' => 'Indonesian',
            'native_name' => 'Bahasa Indonesia',
            'flag' => '🇮🇩',
            'dir' => 'ltr',
        ],
    ],
    'default' => env('APP_LOCALE', 'en'),
    'fallback' => env('APP_FALLBACK_LOCALE', 'en'),
];
```

**What references this config:**

- `SetLocale` middleware → validates against `config('locales.supported')`
- `HandleInertiaRequests` → shares full locale config to frontend
- `UpdateLocaleRequest` → validates `locale` against config keys
- `LanguageSwitcher.tsx` → renders dynamically from shared props (flags, names)
- `locale:scaffold` Artisan command → reads config to validate requested locale
- `users.locale` column validation → accepts only keys from config

**Artisan `locale:scaffold {locale}` command:**

- Creates `public/locales/{locale}/` directory with empty JSON stubs for all registered namespaces
- Creates `lang/{locale}/` directory with PHP file stubs matching `lang/en/`
- Registers the new locale in `config/locales.php` `supported` array
- Outputs a checklist of next steps

## Decision 3: UGC Translation Data Model

**Choice:** Use a polymorphic `content_translations` table rather than JSON columns on individual models.

```
content_translations
├── id (bigint PK)
├── translatable_type (string) — e.g., 'App\Models\Farm', 'App\Models\Article'
├── translatable_id (bigint)
├── locale (string) — e.g., 'id', 'ms'
├── field (string) — e.g., 'description', 'title', 'content'
├── value (text) — the translated content
├── status (enum) — 'draft', 'machine_translated', 'under_review', 'approved'
├── source (enum) — 'human', 'machine'
├── reviewed_by (bigint FK nullable → users.id)
├── reviewed_at (timestamp nullable)
├── created_at (timestamp)
├── updated_at (timestamp)
```

**Why polymorphic table over JSON columns?**

- JSON columns require `JSON_CONTAINS` which is SQLite-incompatible (test DB uses SQLite)
- A separate table allows querying "all untranslated content" across all models efficiently
- Translation workflow metadata (status, reviewer, source) is per-field/per-locale — embedded JSON would be deeply nested
- Indexable: `INDEX(translatable_type, translatable_id, locale, field)` for fast lookup

**Why not `spatie/laravel-translatable`?**

- Spatie's package uses JSON columns on the model — hits the SQLite limitation
- Spatie doesn't support translation workflow (status, reviewer, provenance) out of the box
- A custom `Translatable` trait on the polymorphic table gives full control over the review workflow

**`Translatable` trait API:**

```php
// app/Concerns/Translatable.php
trait Translatable {
    public function translations(): MorphMany { ... }
    public function getTranslation(string $field, string $locale): ?string { ... }
    public function setTranslation(string $field, string $locale, string $value, string $source = 'human'): void { ... }
    public function translatedAttribute(string $field): string { ... } // Uses active locale with fallback
}
```

**Frontend display:** The `translatedAttribute()` accessor returns the approved translation for the active locale, falling back to the default locale's original value if no approved translation exists. Controllers pass the translated values to Inertia pages.

## Decision 4: Machine Translation Pipeline

**Choice:** Google Cloud Translation API (v3 Basic) as the primary provider, with a pluggable adapter pattern.

**Why Google over DeepL or LibreTranslate?**

- Google has strong Indonesian language support (DeepL doesn't support Indonesian as of 2025)
- LibreTranslate self-hosted adds infrastructure burden
- The adapter pattern allows switching providers later

**Architecture:**

```
TranslationService (interface)
  └── GoogleTranslationService (implementation)
       └── Uses google/cloud-translate SDK
```

**Rate limiting:**

- Max 100 API calls per minute (configurable via `config/locales.php`)
- Cost tracking: log every API call with character count for billing visibility
- Queue long-running batch translations as Laravel jobs

**Static string translation CLI:**

```
php artisan translate:generate en id --namespace=farms
```

- Reads `public/locales/en/farms.json`
- For each key without an `id` counterpart, calls the translation API
- Outputs a draft `public/locales/id/farms.json.draft` file for human review
- Does NOT overwrite existing approved translations

**UGC translation flow:**

1. Admin clicks "Generate Draft Translation" on a farm/article
2. System calls `TranslationService::translate()` for each translatable field
3. Result stored in `content_translations` with `status = 'machine_translated'`
4. Appears in the admin review queue
5. Reviewer approves/edits → `status = 'approved'` → visible to end users

## Admin Translation UI

**Pages:**

- `Admin/Translations/Index.tsx` — Dashboard: translation progress per locale per content type (% complete, % reviewed)
- `Admin/Translations/Review.tsx` — Review queue: filterable list of `machine_translated` and `under_review` entries
- `Admin/Translations/Edit.tsx` — Side-by-side editor: original content (left) → editable translation (right)

**Integration with existing admin panel:** New sidebar menu item under Admin: "Translations" with sub-items "Dashboard" and "Review Queue".

## Risks / Trade-offs

| Risk                                                                              | Mitigation                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 500+ translation keys to create and translate — significant initial effort        | Phase 1: critical user flows (auth, farms, investments); Phase 2: admin pages. Machine translation generates drafts.                                        |
| Indonesian text is ~20-30% longer than English — may break UI layouts             | QA pass in `id` locale; use `truncate` and responsive Tailwind utilities; test critical pages                                                               |
| `content_translations` table could grow large with many models × fields × locales | Add database index on `(translatable_type, translatable_id, locale, field)`; consider table partitioning if >1M rows                                        |
| Google Cloud Translation API costs                                                | Rate limiting, character count logging, batching. Estimated cost: <$5/month for current content volume                                                      |
| Machine translations may miss agricultural/investment domain terms                | Maintain a glossary file (`docs/translation-glossary.md`) with preferred translations for domain terms (e.g., "harvest" → "panen", "payout" → "pembayaran") |
| Stale translations when original content is updated                               | `Translatable` trait fires an event when the original field changes → marks all translations as `needs_review`                                              |

## Migration Plan

### Phase 1: Static String Coverage (Sections 1-6 of epic)

1. Create namespace JSON files (admin, farms, investments, harvests, education, auth) for EN and ID
2. Update `i18n.ts` to register all namespaces
3. Translate shared components (Navbar, status badges, pagination)
4. Translate layouts (GuestLayout, AuthenticatedLayout, AppLayout)
5. Translate page components by domain (auth → farms → investments → admin)
6. Expand server-side `lang/` PHP files with domain-specific files
7. Add tests for locale-specific rendering

### Phase 2: Config-Driven Architecture (Section 8 of epic)

8. Create `config/locales.php`
9. Refactor all locale references to use centralized config
10. Update `LanguageSwitcher` for dynamic rendering with flags
11. Create `locale:scaffold` Artisan command
12. Write `docs/adding-new-locale.md`

### Phase 3: UGC Translation (Section 9 of epic)

13. Create `content_translations` migration and model
14. Create `Translatable` trait
15. Apply trait to `Farm` and `Article` models
16. Build admin translation management UI
17. Update controllers to serve translated content

### Phase 4: Machine Translation Pipeline (Section 10 of epic)

18. Integrate Google Cloud Translation API
19. Create `TranslationService` with adapter pattern
20. Create `translate:generate` Artisan command
21. Add "Generate Draft Translation" button in admin UI
22. Build review queue with approve/edit/reject workflow
23. Add provenance tracking and rate limiting

## Open Questions

- Should the `locale:scaffold` command also create empty rows in `content_translations` for all existing translatable models? (Recommendation: No — create translation rows on-demand when content is actually translated)
- Should machine translation be available for static UI strings via the admin UI, or only via CLI? (Recommendation: CLI only for static strings — admin UI for UGC only)
- What is the minimum viable set of pages for Phase 1? (Recommendation: Auth pages, Welcome, Farms Index/Show, Investments Index/Show, all Navbar strings — covers the primary investor flow)
