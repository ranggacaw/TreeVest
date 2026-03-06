<?php
$en = [
    'search_title' => 'Search: {{query}}',
    'search_results' => 'Search Results',
    'no_results_found' => 'No results found',
    'found_results' => 'Found {{count}} result',
    'found_results_plural' => 'Found {{count}} results',
    'searching_for' => 'Searching for:',
    'in_category' => 'in category:',
    'with_tag' => 'with tag:',
    'clear_filters' => 'Clear Filters',
    'views' => 'views',
    'no_articles_found' => 'We couldn\'t find any articles matching your search. Try adjusting your search terms or filters.',
    'browse_all_articles' => 'Browse All Articles'
];
$id = [
    'search_title' => 'Pencarian: {{query}}',
    'search_results' => 'Hasil Pencarian',
    'no_results_found' => 'Tidak ada hasil yang ditemukan',
    'found_results' => 'Ditemukan {{count}} hasil',
    'found_results_plural' => 'Ditemukan {{count}} hasil',
    'searching_for' => 'Mencari untuk:',
    'in_category' => 'dalam kategori:',
    'with_tag' => 'dengan tag:',
    'clear_filters' => 'Hapus Filter',
    'views' => 'tayangan',
    'no_articles_found' => 'Kami tidak dapat menemukan artikel yang sesuai dengan pencarian Anda. Coba sesuaikan istilah atau filter pencarian Anda.',
    'browse_all_articles' => 'Jelajahi Semua Artikel'
];
file_put_contents('public/locales/en/search.json', json_encode($en, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
file_put_contents('public/locales/id/search.json', json_encode($id, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
