<?php
$en = [
    'notification_settings' => 'Notification Settings',
    'manage_notifications' => 'Manage which notifications you receive and how',
    'type' => 'Type',
    'saving' => 'Saving...',
    'save_preferences' => 'Save Preferences'
];
$id = [
    'notification_settings' => 'Pengaturan Notifikasi',
    'manage_notifications' => 'Kelola notifikasi apa yang Anda terima dan bagaimana caranya',
    'type' => 'Tipe',
    'saving' => 'Menyimpan...',
    'save_preferences' => 'Simpan Preferensi'
];
file_put_contents('public/locales/en/settings.json', json_encode($en, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
file_put_contents('public/locales/id/settings.json', json_encode($id, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
