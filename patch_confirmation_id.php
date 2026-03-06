<?php
$json = file_get_contents('public/locales/id/investments.json');
$data = json_decode(h Metode Pembayaran';
$data['view_all_investments'] = 'Lihat Semua Investasi';

file_put_contents('public/locales/id/investments.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
