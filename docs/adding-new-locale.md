# Adding a New Locale

This guide explains how to add a new language translation (locale) to the TreeVest application. The localization system is built to be config-driven, making this process straightforward.

## Step 1: Scaffold Translation Files

We provide an Artisan command to automatically generate the necessary translation file structure for your new locale.

Run the following command (replace `ms` with your locale code, e.g., `es` for Spanish, `fr` for French):

```bash
php artisan locale:scaffold ms
```

This command will:

1. Create `public/locales/{locale}/*.json` with empty string values matching the English namespace keys.
2. Create `lang/{locale}/*.php` with empty array values matching the English server-side message keys.

## Step 2: Register the Locale in Config

Open `config/locales.php` and add your new locale to the `supported` array:

```php
'supported' => [
    'en' => [
        'code' => 'en',
        'name' => 'English',
        'native_name' => 'English',
        'flag' => '🇬🇧',
        'dir' => 'ltr',
    ],
    'id' => [
        'code' => 'id',
        'name' => 'Indonesian',
        'native_name' => 'Bahasa Indonesia',
        'flag' => '🇮🇩',
        'dir' => 'ltr',
    ],
    // Add your new locale here
    'ms' => [
        'code' => 'ms',
        'name' => 'Malay',
        'native_name' => 'Bahasa Melayu',
        'flag' => '🇲🇾',
        'dir' => 'ltr', // Use 'rtl' for right-to-left languages like Arabic
    ],
],
```

The application's middleware and components (like `LanguageSwitcher`) will automatically render this new locale based on the configuration.

## Step 3: Translate the Files

Now you need to replace the empty strings with actual translations.

### Frontend JSON Files (`public/locales/{locale}/`)

These files contain the static strings for the React UI. Translate the values in files like `admin.json`, `farms.json`, etc.

```json
// public/locales/ms/translation.json
{
    "welcome": "Selamat Datang"
}
```

### Backend PHP Files (`lang/{locale}/`)

These files contain the server-side flash messages, validation errors, and email notifications. Translate the array values.

```php
// lang/ms/validation.php
return [
    'required' => 'Medan :attribute diperlukan.',
];
```

## Step 4: Validate

1. Refresh the application.
2. The `LanguageSwitcher` in the Navbar should now list your new locale.
3. Switch to it and verify that your translations are appearing correctly throughout the site.
