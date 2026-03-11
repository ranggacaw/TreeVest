<?php

$json = file_get_contents('public/locales/id/trees.json');
$data = json_decode($json, true);

$data['no_image_available'] = 'Gambar Tidak Tersedia';

file_put_contents('public/locales/id/trees.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
