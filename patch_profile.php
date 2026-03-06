<?php
$en = [
    'profile' => 'Profile',
    'phone_number' => 'Phone Number',
    'phone_desc' => 'Add a phone number to enable phone-based login and two-factor authentication.',
    'verified' => 'Verified',
    'not_verified' => 'Not Verified',
    'update_phone' => 'Update Phone Number',
    'add_phone' => 'Add Phone Number',
    'account_security' => 'Account Security',
    'security_desc' => 'Manage your account security settings including two-factor authentication and active sessions.',
    'two_factor_auth' => 'Two-Factor Authentication',
    'manage_sessions' => 'Manage Browser Sessions',
    'account_settings_link' => 'Account Settings (Deactivate/Delete)'
];
$id = [
    'profile' => 'Profil',
    'phone_number' => 'Nomor Telepon',
    'phone_desc' => 'Tambahkan nomor telepon untuk mengaktifkan login berbasis telepon dan autentikasi dua faktor.',
    'verified' => 'Terverifikasi',
    'not_verified' => 'Belum Terverifikasi',
    'update_phone' => 'Perbarui Nomor Telepon',
    'add_phone' => 'Tambahkan Nomor Telepon',
    'account_security' => 'Keamanan Akun',
    'security_desc' => 'Kelola pengaturan keamanan akun Anda termasuk autentikasi dua faktor dan sesi aktif.',
    'two_factor_auth' => 'Autentikasi Dua Faktor',
    'manage_sessions' => 'Kelola Sesi Peramban',
    'account_settings_link' => 'Pengaturan Akun (Nonaktifkan/Hapus)'
];
file_put_contents('public/locales/en/profile.json', json_encode($en, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
file_put_contents('public/locales/id/profile.json', json_encode($id, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
