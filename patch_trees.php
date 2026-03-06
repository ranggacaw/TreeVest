<?php
$en = [
    'marketplace' => 'Marketplace',
    'tree_marketplace' => 'Tree Marketplace',
    'tree_marketplace_subtitle' => 'Invest in productive fruit trees and earn returns on every harvest.',
    'filters' => 'Filters',
    'variant_search' => 'Variant Search',
    'variant_search_placeholder' => 'e.g. Musang King',
    'risk_rating' => 'Risk Rating',
    'any' => 'Any',
    'low' => 'Low',
    'medium' => 'Medium',
    'high' => 'High',
    'harvest_cycle' => 'Harvest Cycle',
    'annual' => 'Annual',
    'biannual' => 'Biannual',
    'seasonal' => 'Seasonal',
    'apply_filters' => 'Apply Filters',
    'no_trees_found' => 'No trees found',
    'try_adjusting_filters' => 'Try adjusting your filters to see more results.',
];
$id = [
    'marketplace' => 'Pasar Pertanian',
    'tree_marketplace' => 'Pasar Pohon',
    'tree_marketplace_subtitle' => 'Berinvestasi di pohon buah produktif dan dapatkan hasil setiap kali panen.',
    'filters' => 'Filter',
    'variant_search' => 'Pencarian Varian',
    'variant_search_placeholder' => 'cth. Musang King',
    'risk_rating' => 'Tingkat Risiko',
    'any' => 'Apapun',
    'low' => 'Rendah',
    'medium' => 'Sedang',
    'high' => 'Tinggi',
    'harvest_cycle' => 'Siklus Panen',
    'annual' => 'Tahunan',
    'biannual' => 'Dua Tahunan',
    'seasonal' => 'Musiman',
    'apply_filters' => 'Terapkan Filter',
    'no_trees_found' => 'Pohon tidak ditemukan',
    'try_adjusting_filters' => 'Coba sesuaikan filter Anda untuk melihat lebih banyak hasil.',
];

file_put_contents('public/locales/en/trees.json', json_encode($en, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
file_put_contents('public/locales/id/trees.json', json_encode($id, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
