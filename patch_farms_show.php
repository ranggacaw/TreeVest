<?php
$enJson = file_get_contents('public/locales/en/farms.json');
$idJson = file_get_contents('public/locales/id/farms.json');
$en = json_decode($enJson, true) ?: [];
$id = json_decode($idJson, true) ?: [];

// Add new keys to English
$en['back_to_farms'] = '← Back to Farms';
$en['no_images_available'] = 'No images available';
$en['about_this_farm'] = 'About This Farm';
$en['historical_performance'] = 'Historical Performance';
$en['certifications'] = 'Certifications';
$en['issuer'] = 'Issuer:';
$en['certificate_no'] = 'Certificate #:';
$en['expires'] = 'Expires:';
$en['farm_details'] = 'Farm Details';
$en['size'] = 'Size';
$en['hectares'] = 'hectares';
$en['capacity'] = 'Capacity';
$en['trees'] = 'trees';
$en['soil_type'] = 'Soil Type';
$en['climate'] = 'Climate';
$en['location'] = 'Location';
$en['location_not_available'] = 'Location not available';
$en['virtual_tour'] = 'Virtual Tour';
$en['view_virtual_tour'] = 'View Virtual Tour';
$en['investment_opportunities'] = 'Investment Opportunities';
$en['cycle'] = 'Cycle:';
$en['hide_options'] = 'Hide Options';
$en['view_options'] = 'View {{count}} Options';
$en['roi'] = 'ROI';
$en['min'] = 'Min:';
$en['max'] = 'Max:';
$en['invest_now'] = 'Invest Now';
$en['no_trees_available'] = 'No trees currently available for investment in this crop.';

// Add new keys to Bahasa Indonesia
$id['back_to_farms'] = '← Kembali ke Kebun';
$id['no_images_available'] = 'Gambar tidak tersedia';
$id['about_this_farm'] = 'Tentang Kebun Ini';
$id['historical_performance'] = 'Kinerja Historis';
$id['certifications'] = 'Sertifikasi';
$id['issuer'] = 'Penerbit:';
$id['certificate_no'] = 'No Sertifikat:';
$id['expires'] = 'Berlaku Hingga:';
$id['farm_details'] = 'Detail Kebun';
$id['size'] = 'Ukuran';
$id['hectares'] = 'hektar';
$id['capacity'] = 'Kapasitas';
$id['trees'] = 'pohon';
$id['soil_type'] = 'Jenis Tanah';
$id['climate'] = 'Iklim';
$id['location'] = 'Lokasi';
$id['location_not_available'] = 'Lokasi tidak tersedia';
$id['virtual_tour'] = 'Tur Virtual';
$id['view_virtual_tour'] = 'Lihat Tur Virtual';
$id['investment_opportunities'] = 'Peluang Investasi';
$id['cycle'] = 'Siklus:';
$id['hide_options'] = 'Sembunyikan Opsi';
$id['view_options'] = 'Lihat {{count}} Opsi';
$id['roi'] = 'ROI';
$id['min'] = 'Min:';
$id['max'] = 'Maks:';
$id['invest_now'] = 'Investasi Sekarang';
$id['no_trees_available'] = 'Saat ini tidak ada pohon yang tersedia untuk investasi pada tanaman ini.';

file_put_contents('public/locales/en/farms.json', json_encode($en, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
file_put_contents('public/locales/id/farms.json', json_encode($id, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
