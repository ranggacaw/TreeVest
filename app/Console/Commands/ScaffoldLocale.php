<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ScaffoldLocale extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'locale:scaffold {locale}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scaffold a new locale with empty translation files matching the English structure';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $locale = $this->argument('locale');

        // We will check if it already exists in the config, though it's not strictly necessary to block if it exists
        // as they might want to scaffold new files for an existing supported locale.
        $supportedLocales = array_keys(config('locales.supported', []));

        if (!in_array($locale, $supportedLocales)) {
            $this->warn("Locale '{$locale}' is not yet in config('locales.supported'). You will need to add it there.");
        }

        $this->info("Scaffolding locale: {$locale}");

        // 1. Scaffold public/locales JSON files
        $this->scaffoldJsonFiles($locale);

        // 2. Scaffold lang/ PHP files
        $this->scaffoldPhpFiles($locale);

        // 3. Output next-steps checklist
        $this->info("\nDone! Next steps:");
        $this->line("1. Add '{$locale}' to the `supported` array in `config/locales.php` (if you haven't already).");
        $this->line("2. Translate the keys in the generated JSON files: `public/locales/{$locale}/*.json`.");
        $this->line("3. Translate the keys in the generated PHP files: `lang/{$locale}/*.php`.");
        $this->line("4. Check the frontend LanguageSwitcher to ensure the new locale appears correctly.");
        $this->line("5. Test rendering pages with the new locale.");

        return 0;
    }

    protected function scaffoldJsonFiles(string $locale): void
    {
        $enDir = public_path('locales/en');
        $targetDir = public_path("locales/{$locale}");

        if (!File::isDirectory($enDir)) {
            $this->error("Cannot find English JSON directory: {$enDir}");
            return;
        }

        if (!File::isDirectory($targetDir)) {
            File::makeDirectory($targetDir, 0755, true);
        }

        $files = File::files($enDir);
        $count = 0;

        foreach ($files as $file) {
            $filename = $file->getFilename();
            $targetPath = $targetDir . '/' . $filename;

            if (File::exists($targetPath)) {
                $this->line("Skipped existing file: public/locales/{$locale}/{$filename}");
                continue;
            }

            $content = json_decode(File::get($file->getPathname()), true);

            if (is_array($content)) {
                // Empty the values but keep the keys
                $emptyContent = $this->emptyArrayValues($content);
                File::put($targetPath, json_encode($emptyContent, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                $count++;
            }
        }

        $this->info("Created {$count} JSON translation stubs in public/locales/{$locale}/");
    }

    protected function scaffoldPhpFiles(string $locale): void
    {
        $enDir = base_path('lang/en');
        $targetDir = base_path("lang/{$locale}");

        if (!File::isDirectory($enDir)) {
            $this->error("Cannot find English PHP lang directory: {$enDir}");
            return;
        }

        if (!File::isDirectory($targetDir)) {
            File::makeDirectory($targetDir, 0755, true);
        }

        $files = File::files($enDir);
        $count = 0;

        foreach ($files as $file) {
            $filename = $file->getFilename();
            $targetPath = $targetDir . '/' . $filename;

            if (File::exists($targetPath)) {
                $this->line("Skipped existing file: lang/{$locale}/{$filename}");
                continue;
            }

            $content = include $file->getPathname();

            if (is_array($content)) {
                $emptyContent = $this->emptyArrayValues($content);
                $phpContent = "<?php\n\nreturn " . $this->exportArray($emptyContent) . ";\n";
                File::put($targetPath, $phpContent);
                $count++;
            }
        }

        $this->info("Created {$count} PHP translation stubs in lang/{$locale}/");
    }

    /**
     * Recursively empty string values in an array.
     */
    protected function emptyArrayValues(array $data): array
    {
        $result = [];
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $result[$key] = $this->emptyArrayValues($value);
            } else {
                $result[$key] = '';
            }
        }
        return $result;
    }

    /**
     * Export an array to a PHP string format
     */
    protected function exportArray(array $array): string
    {
        $export = var_export($array, true);

        // Convert array() to []
        $export = preg_replace('/^([ ]*)array \(/m', '$1[', $export);
        $export = preg_replace('/^([ ]*)\)/m', '$1]', $export);

        // Fix indentation for arrays
        $export = str_replace("=> \n  [", "=> [", $export);

        return $export;
    }
}
