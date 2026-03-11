<?php

namespace App\Console\Commands;

use App\Services\Translation\TranslationServiceInterface;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class GenerateTranslation extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'translate:generate 
                            {source : The source locale (e.g., en)} 
                            {target : The target locale (e.g., id)} 
                            {--namespace= : Limit to a specific namespace file}
                            {--php : Process lang/ PHP files instead of public/locales JSON files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate draft machine translations for static string files';

    protected $translationService;

    public function __construct(TranslationServiceInterface $translationService)
    {
        parent::__construct();
        $this->translationService = $translationService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $source = $this->argument('source');
        $target = $this->argument('target');
        $namespace = $this->option('namespace');
        $isPhp = $this->option('php');

        $this->info("Generating translations from {$source} to {$target}");

        if ($isPhp) {
            $this->processPhpFiles($source, $target, $namespace);
        } else {
            $this->processJsonFiles($source, $target, $namespace);
        }

        return Command::SUCCESS;
    }

    protected function processJsonFiles(string $source, string $target, ?string $namespaceOption)
    {
        $sourceDir = public_path("locales/{$source}");
        $targetDir = public_path("locales/{$target}");

        if (! File::isDirectory($sourceDir)) {
            $this->error("Source directory not found: {$sourceDir}");

            return;
        }

        if (! File::isDirectory($targetDir)) {
            File::makeDirectory($targetDir, 0755, true);
        }

        $files = File::files($sourceDir);

        foreach ($files as $file) {
            $filename = $file->getFilename();
            $namespace = pathinfo($filename, PATHINFO_FILENAME);

            if ($namespaceOption && $namespaceOption !== $namespace) {
                continue;
            }

            $this->info("Processing {$filename}...");

            $sourceContent = json_decode(File::get($file->getPathname()), true);
            $targetPath = $targetDir.'/'.$filename;

            $targetContent = [];
            if (File::exists($targetPath)) {
                $targetContent = json_decode(File::get($targetPath), true) ?: [];
            }

            $draftPath = $targetPath.'.draft';
            $draftContent = [];
            if (File::exists($draftPath)) {
                $draftContent = json_decode(File::get($draftPath), true) ?: [];
            }

            $toTranslate = $this->findMissingKeys($sourceContent, $targetContent, $draftContent);

            if (empty($toTranslate)) {
                $this->line("No missing translations found in {$filename}.");
                continue;
            }

            $this->line('Found '.count($toTranslate).' missing keys. Translating...');

            $translated = $this->translateBatch($toTranslate, $source, $target);

            $newDraftContent = array_merge($draftContent, $translated);

            // Merging keeping structure
            $finalDraft = $this->mergeTranslatedStructure($sourceContent, $newDraftContent);

            File::put($draftPath, json_encode($finalDraft, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $this->info("Generated draft file: public/locales/{$target}/{$filename}.draft");
        }
    }

    protected function processPhpFiles(string $source, string $target, ?string $namespaceOption)
    {
        $sourceDir = base_path("lang/{$source}");
        $targetDir = base_path("lang/{$target}");

        if (! File::isDirectory($sourceDir)) {
            $this->error("Source directory not found: {$sourceDir}");

            return;
        }

        if (! File::isDirectory($targetDir)) {
            File::makeDirectory($targetDir, 0755, true);
        }

        $files = File::files($sourceDir);

        foreach ($files as $file) {
            $filename = $file->getFilename();
            $namespace = pathinfo($filename, PATHINFO_FILENAME);

            if ($namespaceOption && $namespaceOption !== $namespace) {
                continue;
            }

            $this->info("Processing {$filename}...");

            $sourceContent = include $file->getPathname();
            $targetPath = $targetDir.'/'.$filename;

            $targetContent = [];
            if (File::exists($targetPath)) {
                $targetContent = include $targetPath;
                if (! is_array($targetContent)) {
                    $targetContent = [];
                }
            }

            $draftPath = $targetPath.'.draft';
            $draftContent = [];
            if (File::exists($draftPath)) {
                $draftContent = include $draftPath;
                if (! is_array($draftContent)) {
                    $draftContent = [];
                }
            }

            $toTranslate = $this->findMissingKeys($sourceContent, $targetContent, $draftContent);

            if (empty($toTranslate)) {
                $this->line("No missing translations found in {$filename}.");
                continue;
            }

            $this->line('Found '.count($toTranslate).' missing keys. Translating...');

            $translated = $this->translateBatch($toTranslate, $source, $target);

            $newDraftContent = array_merge($draftContent, $translated);
            $finalDraft = $this->mergeTranslatedStructure($sourceContent, $newDraftContent);

            $phpContent = "<?php\n\nreturn ".$this->exportArray($finalDraft).";\n";
            File::put($draftPath, $phpContent);
            $this->info("Generated draft file: lang/{$target}/{$filename}.draft");
        }
    }

    /**
     * Find keys that exist in source but are empty in target and draft
     */
    protected function findMissingKeys(array $source, array $target, array $draft, string $prefix = ''): array
    {
        $missing = [];

        foreach ($source as $key => $value) {
            $fullKey = $prefix ? "{$prefix}.{$key}" : $key;

            if (is_array($value)) {
                $childTarget = isset($target[$key]) && is_array($target[$key]) ? $target[$key] : [];
                $childDraft = isset($draft[$key]) && is_array($draft[$key]) ? $draft[$key] : [];
                $missing = array_merge($missing, $this->findMissingKeys($value, $childTarget, $childDraft, $fullKey));
            } else {
                $targetVal = \Illuminate\Support\Arr::get($target, $fullKey);
                $draftVal = \Illuminate\Support\Arr::get($draft, $fullKey);

                // If it's empty in target AND empty in draft, we need to translate it
                if ((empty($targetVal) || $targetVal === $value) && empty($draftVal)) {
                    // Only translate non-empty source strings
                    if (! empty($value)) {
                        $missing[$fullKey] = $value;
                    }
                }
            }
        }

        return $missing;
    }

    protected function translateBatch(array $items, string $source, string $target): array
    {
        // Simple batching to not hit limits (dummy implementation limits batch size)
        $translated = [];
        $values = array_values($items);
        $keys = array_keys($items);

        try {
            // we batch by 10 to avoid huge requests if using real API
            $chunks = array_chunk($values, 10);
            $keyChunks = array_chunk($keys, 10);

            foreach ($chunks as $index => $chunk) {
                // In generic Google Translate API, you pass an array of strings
                $results = $this->translationService->translate($chunk, $source, $target);

                foreach ($results as $i => $val) {
                    $translated[$keyChunks[$index][$i]] = $val;
                }

                // Simple delay to avoid rate limits if there are many chunks
                if (count($chunks) > 1 && $index < count($chunks) - 1) {
                    sleep(1);
                }
            }
        } catch (Exception $e) {
            $this->error('Translation failed: '.$e->getMessage());
        }

        return $translated;
    }

    protected function mergeTranslatedStructure(array $source, array $flatTranslations): array
    {
        $result = [];

        foreach ($source as $key => $value) {
            if (is_array($value)) {
                $result[$key] = $this->mergeTranslatedStructurePrefix($value, $flatTranslations, $key);
            } else {
                $result[$key] = $flatTranslations[$key] ?? '';
            }
        }

        return $result;
    }

    protected function mergeTranslatedStructurePrefix(array $source, array $flatTranslations, string $prefix): array
    {
        $result = [];
        foreach ($source as $key => $value) {
            $fullKey = "{$prefix}.{$key}";
            if (is_array($value)) {
                $result[$key] = $this->mergeTranslatedStructurePrefix($value, $flatTranslations, $fullKey);
            } else {
                $result[$key] = $flatTranslations[$fullKey] ?? '';
            }
        }

        return $result;
    }

    protected function exportArray(array $array): string
    {
        $export = var_export($array, true);
        $export = preg_replace('/^([ ]*)array \(/m', '$1[', $export);
        $export = preg_replace('/^([ ]*)\)/m', '$1]', $export);
        $export = str_replace("=> \n  [", '=> [', $export);

        return $export;
    }
}
