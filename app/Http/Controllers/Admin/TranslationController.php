<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ContentTranslation;
use Illuminate\Support\Facades\DB;

class TranslationController extends Controller
{
    /**
     * Map of user-friendly names to actual model classes
     */
    protected $translatableModels = [
        'Farm' => \App\Models\Farm::class,
        'Article' => \App\Models\Article::class,
    ];

    public function index(Request $request)
    {
        $locale = $request->get('locale', 'id'); // Default target locale

        $stats = [];

        foreach ($this->translatableModels as $name => $class) {
            $totalCount = $class::count();

            if ($totalCount === 0) {
                continue;
            }

            // A somewhat simplified coverage metric: how many models have at least one approved translation
            $translatedCount = $class::whereHas('translations', function ($query) use ($locale) {
                $query->where('locale', $locale)->where('status', 'approved');
            })->count();

            $pendingCount = $class::whereHas('translations', function ($query) use ($locale) {
                $query->where('locale', $locale)->whereIn('status', ['under_review', 'machine_translated']);
            })->count();

            $stats[] = [
                'type' => $name,
                'total' => $totalCount,
                'translated' => $translatedCount,
                'pending_review' => $pendingCount,
                'percentage' => $totalCount > 0 ? ($translatedCount / $totalCount) * 100 : 0,
            ];
        }

        $supportedLocales = array_filter(config('locales.supported', []), function ($val, $key) {
            return $key !== config('locales.default', 'en'); // Exclude the default locale from targets
        }, ARRAY_FILTER_USE_BOTH);

        $localesList = [];
        foreach ($supportedLocales as $code => $data) {
            $localesList[$code] = $data['name'] . ' ' . $data['flag'];
        }

        $machineTranslations = ContentTranslation::where('source', 'machine')
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->get();

        $charactersThisMonth = $machineTranslations->sum(function ($t) {
            return mb_strlen($t->value ?? ''); });
        $estimatedCost = ($charactersThisMonth / 1000000) * 20; // $20 per 1M characters

        $apiUsage = [
            'characters_this_month' => $charactersThisMonth,
            'estimated_cost' => round($estimatedCost, 2),
        ];

        return Inertia::render('Admin/Translations/Index', [
            'stats' => $stats,
            'locale' => $locale,
            'availableLocales' => $localesList,
            'apiUsage' => $apiUsage,
        ]);
    }

    /*
     * Custom list function for the UI not explicitly in the tasks but necessary
     */
    public function list(Request $request, $type)
    {
        $locale = $request->get('locale', 'id');

        if (!isset($this->translatableModels[$type])) {
            abort(404, 'Translatable type not found');
        }

        $class = $this->translatableModels[$type];

        // Use pagination
        $items = $class::with([
            'translations' => function ($query) use ($locale) {
                $query->where('locale', $locale);
            }
        ])->paginate(15);

        $mappedItems = $items->through(function ($item) use ($locale) {
            $status = 'missing';
            $trans = $item->translations->first();

            if ($trans) {
                $status = $trans->status;
            }

            return [
                'id' => $item->id,
                'title' => $item->name ?? $item->title ?? 'Item #' . $item->id,
                'status' => $status,
                'updated_at' => $item->updated_at,
            ];
        });

        return Inertia::render('Admin/Translations/List', [
            'items' => $mappedItems,
            'type' => $type,
            'locale' => $locale,
        ]);
    }

    public function edit(Request $request, $type, $id)
    {
        $locale = $request->get('locale', 'id');

        if (!isset($this->translatableModels[$type])) {
            abort(404, 'Translatable model not mapped');
        }

        $class = $this->translatableModels[$type];
        $model = $class::findOrFail($id);

        $translatableFields = $model->translatable ?? [];
        $existingTranslations = $model->translations()->where('locale', $locale)->get()->keyBy('field');

        $fields = [];
        foreach ($translatableFields as $field) {
            $trans = $existingTranslations->get($field);

            $fields[$field] = [
                'original' => $model->$field,
                'translated' => $trans ? $trans->value : '',
                'status' => $trans ? $trans->status : null,
                'source' => $trans ? $trans->source : null,
                'translation_id' => $trans ? $trans->id : null,
            ];
        }

        $item = [
            'id' => $model->id,
            'original_id' => $model->id,
            'original_model' => $class,
            'fields' => $fields,
        ];

        return Inertia::render('Admin/Translations/Edit', [
            'item' => $item,
            'locale' => $locale,
            'type' => $type,
        ]);
    }

    public function update(Request $request, $type, $id)
    {
        $locale = $request->get('locale', 'id');

        if (!isset($this->translatableModels[$type])) {
            abort(404);
        }

        $class = $this->translatableModels[$type];
        $model = $class::findOrFail($id);

        $translatableFields = $model->translatable ?? [];

        // Validate
        $rules = [];
        foreach ($translatableFields as $field) {
            $rules[$field] = ['nullable', 'string'];
        }
        $data = $request->validate($rules);

        // Update or create
        foreach ($translatableFields as $field) {
            if (isset($data[$field]) && !empty($data[$field])) {
                $model->setTranslation($field, $locale, $data[$field], 'human', 'approved');
            }
        }

        return redirect()->route('admin.translations.list', ['type' => $type, 'locale' => $locale])
            ->with('success', 'Translations saved and approved successfully.');
    }

    public function generateDraft(Request $request, $type, $id, \App\Services\Translation\TranslationServiceInterface $translationService)
    {
        $locale = $request->get('locale', 'id');
        $sourceLocale = config('locales.default', 'en');

        if (!isset($this->translatableModels[$type])) {
            abort(404);
        }

        $class = $this->translatableModels[$type];
        $model = $class::findOrFail($id);

        $translatableFields = $model->translatable ?? [];
        $existingTranslations = $model->translations()->where('locale', $locale)->get()->keyBy('field');

        $generatedCount = 0;

        foreach ($translatableFields as $field) {
            $existing = $existingTranslations->get($field);

            // Only generate draft if it doesn't exist or is currently a draft
            if (!$existing || in_array($existing->status, ['draft', 'machine_translated'])) {
                $originalText = $model->$field;

                if (!empty($originalText)) {
                    try {
                        $translatedText = $translationService->translate($originalText, $sourceLocale, $locale);
                        // Save as machine_translated
                        $model->setTranslation($field, $locale, $translatedText, 'machine', 'machine_translated');
                        $generatedCount++;
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error("Draft generation failed for {$type} {$id} {$field}: " . $e->getMessage());
                    }
                }
            }
        }

        return redirect()->back()->with('success', "Generated {$generatedCount} draft translations.");
    }

    public function queue(Request $request)
    {
        $locale = $request->get('locale', 'id');

        $type = $request->get('type');
        $status = $request->get('status');
        $dateStart = $request->get('date_start');
        $dateEnd = $request->get('date_end');

        $query = ContentTranslation::with('translatable')
            ->where('locale', $locale)
            ->orderBy('updated_at', 'desc');

        if ($type && isset($this->translatableModels[$type])) {
            $query->where('translatable_type', $this->translatableModels[$type]);
        }

        if ($status) {
            $query->where('status', $status);
        } else {
            $query->whereIn('status', ['under_review', 'machine_translated']);
        }

        if ($dateStart) {
            $query->whereDate('updated_at', '>=', $dateStart);
        }

        if ($dateEnd) {
            $query->whereDate('updated_at', '<=', $dateEnd);
        }

        $translations = $query->paginate(15)->withQueryString();

        // We map to add the "original_text"
        $mapped = $translations->through(function ($trans) {
            $model = $trans->translatable;
            $original = $model ? $model->{$trans->field} : '';
            $friendlyType = array_search($trans->translatable_type, $this->translatableModels) ?: class_basename($trans->translatable_type);

            return [
                'id' => $trans->id,
                'type_name' => $friendlyType,
                'item_id' => $trans->translatable_id,
                'field' => $trans->field,
                'status' => $trans->status,
                'source' => $trans->source,
                'original' => $original,
                'translated' => $trans->value,
                'updated_at' => $trans->updated_at,
            ];
        });

        $supportedLocales = array_filter(config('locales.supported', []), function ($val, $key) {
            return $key !== config('locales.default', 'en');
        }, ARRAY_FILTER_USE_BOTH);

        $localesList = [];
        foreach ($supportedLocales as $code => $data) {
            $localesList[$code] = $data['name'] . ' ' . $data['flag'];
        }

        $filters = [
            'type' => $type,
            'status' => $status,
            'date_start' => $dateStart,
            'date_end' => $dateEnd,
        ];

        return Inertia::render('Admin/Translations/Queue', [
            'translations' => $mapped,
            'locale' => $locale,
            'availableLocales' => $localesList,
            'filters' => $filters,
            'contentTypes' => array_keys($this->translatableModels),
        ]);
    }

    public function approve(Request $request, $id)
    {
        $translation = ContentTranslation::findOrFail($id);

        $request->validate([
            'value' => 'nullable|string'
        ]);

        if ($request->has('value')) {
            $translation->value = $request->input('value');
        }

        $translation->status = 'approved';
        $translation->reviewer_id = auth()->id();
        $translation->reviewed_at = now();
        $translation->save();

        return redirect()->back()->with('success', 'Translation approved successfully.');
    }

    public function reject(Request $request, $id)
    {
        $translation = ContentTranslation::findOrFail($id);

        // 15.4 Automatically delete or archive rejected translations
        // For simplicity, we just delete them. The user can regenerate.
        $translation->delete();

        return redirect()->back()->with('success', 'Translation rejected and deleted.');
    }

    public function batchApprove(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:content_translations,id'
        ]);

        ContentTranslation::whereIn('id', $request->ids)->update([
            'status' => 'approved',
            'reviewer_id' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return redirect()->back()->with('success', count($request->ids) . ' translations approved successfully.');
    }
}
