<?php
$en = [
    'partner_farms' => 'PARTNER FARMS',
    'browse_farms' => 'Browse Farms',
    'browse_farms_subtitle' => 'Discover vetted agricultural opportunities across the globe. Invest directly in mature orchards and share in the harvest yields.',
    'search_placeholder' => 'Search by farm name or location...',
    'all_regions' => 'All Regions',
    'all_climates' => 'All Climates',
    'grid_view' => 'Grid View',
    'map_view' => 'Map View',
    'no_farms_found' => 'No farms found',
    'no_farms_desc' => 'We couldn\'t find any farms matching your current filters. Try adjusting your search criteria or exploring different regions.',
    'clear_filters' => 'Clear all filters'
];
$id = [
    'partner_farms' => 'MITRA PETERNAKAN',
    'browse_farms' => 'Telusuri Kebun',
    'browse_farms_subtitle' => 'Temukan peluang pertanian yang telah diperiksa di seluruh dunia. Berinvestasi langsung di kebun yang sudah matang dan bagikan hasil panen.',
    'search_placeholder' => 'Cari berdasarkan nama kebun atau lokasi...',
    'all_regions' => 'Semua Wilayah',
    'all_climates' => 'Semua Iklim',
    'grid_view' => 'Tampilan Grid',
    'map_view' => 'Tampilan Peta',
    'no_farms_found' => 'Kebun tidak ditemukan',
    'no_farms_desc' => 'Kami tidak dapat menemukan kebun yang cocok dengan filter Anda saat ini. Coba sesuaikan kriteria pencarian Anda atau jelajahi wilayah yang berbeda.',
    'clear_filters' => 'Hapus semua filter'
];
if (!file_exists('public/locales/en')) mkdir('public/locales/en', 0777, true);
if (!file_exists('public/locales/id')) mkdir('public/locales/id', 0777, true);
file_put_contents('public/locales/en/farms.json', json_encode($en, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
file_put_contents('public/locales/id/farms.json', json_encode($id, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
