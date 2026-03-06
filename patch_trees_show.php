<?php
$enJson = file_get_contents('public/locales/en/trees.json');
$idJson = file_get_contents('public/locales/id/trees.json');

$en = json_decode($enJson, true);
$id = json_decode($idJson, true);

// EN translations
$en['invest_in_tree'] = 'Invest in {{name}}';
$en['no_image_available'] = 'No Image Available';
$en['tree_investment'] = 'Tree Investment';
$en['expected_roi'] = 'Expected ROI';
$en['current_price'] = 'Current Price';
$en['tree_age'] = 'Tree Age';
$en['years'] = '{{count}} Years';
$en['lifespan'] = 'Lifespan';
$en['status'] = 'Status';
$en['harvest_cycle_label'] = 'Harvest Cycle';
$en['investment_limits'] = 'Investment Limits';
$en['minimum'] = 'Minimum:';
$en['maximum'] = 'Maximum:';
$en['risk_disclosure_title'] = 'Risk Disclosure:';
$en['risk_disclosure_text'] = 'Agricultural investments are subject to weather, pest, and market risks. Past yields do not guarantee future returns.';
$en['invest_now'] = 'Invest Now';

$en['health_status'] = 'Health Status';
$en['last_updated'] = 'Last Updated:';
$en['no_updates_yet'] = 'No updates yet';
$en['active_alerts'] = 'Active Alerts:';
$en['recent_updates'] = 'Recent Updates';
$en['view_all_updates'] = 'View all updates →';

$en['current_weather'] = 'Current Weather';
$en['humidity'] = 'Humidity';
$en['wind_speed'] = 'Wind Speed';
$en['rainfall'] = 'Rainfall';
$en['updated'] = 'Updated';

$en['historical_harvests'] = 'Historical Harvests';
$en['date'] = 'Date';
$en['estimated_yield'] = 'Estimated Yield (kg)';
$en['actual_yield'] = 'Actual Yield (kg)';
$en['grade'] = 'Grade';
$en['no_historical_data'] = 'No historical harvest data available for this tree yet.';

// ID translations
$id['invest_in_tree'] = 'Investasi pada {{name}}';
$id['no_image_available'] = 'Gambar Tidak Tersedia';
$id['tree_investment'] = 'Investasi Pohon';
$id['expected_roi'] = 'Estimasi ROI';
$id['current_price'] = 'Harga Saat Ini';
$id['tree_age'] = 'Usia Pohon';
$id['years'] = '{{count}} Tahun';
$id['lifespan'] = 'Masa Hidup';
$id['status'] = 'Status';
$id['harvest_cycle_label'] = 'Siklus Panen';
$id['investment_limits'] = 'Batas Investasi';
$id['minimum'] = 'Minimum:';
$id['maximum'] = 'Maksimum:';
$id['risk_disclosure_title'] = 'Pengungkapan Risiko:';
$id['risk_disclosure_text'] = 'Investasi pertanian rentan terhadap risiko cuaca, hama, dan pasar. Hasil masa lalu tidak menjamin keuntungan di masa depan.';
$id['invest_now'] = 'Investasi Sekarang';

$id['health_status'] = 'Status Kesehatan';
$id['last_updated'] = 'Terakhir Diperbarui:';
$id['no_updates_yet'] = 'Belum ada pembaruan';
$id['active_alerts'] = 'Peringatan Aktif:';
$id['recent_updates'] = 'Pembaruan Terbaru';
$id['view_all_updates'] = 'Lihat semua pembaruan →';

$id['current_weather'] = 'Cuaca Saat Ini';
$id['humidity'] = 'Kelembaban';
$id['wind_speed'] = 'Kecepatan Angin';
$id['rainfall'] = 'Curah Hujan';
$id['updated'] = 'Diperbarui';

$id['historical_harvests'] = 'Panen Historis';
$id['date'] = 'Tanggal';
$id['estimated_yield'] = 'Estimasi Hasil (kg)';
$id['actual_yield'] = 'Hasil Aktual (kg)';
$id['grade'] = 'Kualitas';
$id['no_historical_data'] = 'Belum ada data panen historis yang tersedia untuk pohon ini.';

file_put_contents('public/locales/en/trees.json', json_encode($en, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
file_put_contents('public/locales/id/trees.json', json_encode($id, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
