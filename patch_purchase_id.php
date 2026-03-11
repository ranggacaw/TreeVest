<?php

$json = file_get_contents('public/locales/id/investments.json');
$data = json_decode($json, true);

$data['invest_in_tree'] = 'Investasi pada Pohon #{{identifier}}';
$data['configure_investment'] = 'Konfigurasi Investasi';
$data['investment_amount'] = 'Jumlah Investasi';
$data['amount_label'] = 'Jumlah ({{formatted}})';
$data['cancel_button'] = 'Batal';

$data['risk_modal_title'] = 'Pengungkapan Risiko';
$data['risk_modal_intro'] = 'Berinvestasi pada pohon buah melibatkan risiko yang signifikan, termasuk namun tidak terbatas pada:';
$data['risk_climate'] = 'Risiko iklim dan cuaca yang mempengaruhi hasil panen';
$data['risk_market'] = 'Fluktuasi harga pasar untuk buah-buahan';
$data['risk_pest'] = 'Risiko hama dan penyakit';
$data['risk_natural_disaster'] = 'Bencana alam yang mempengaruhi lahan pertanian';
$data['risk_regulatory'] = 'Perubahan regulasi yang mempengaruhi operasi pertanian';
$data['risk_operator'] = 'Risiko kinerja operator pertanian';
$data['risk_modal_outro'] = 'Kinerja masa lalu tidak menjamin hasil di masa depan. Estimasi ROI didasarkan pada data historis dan proyeksi yang mungkin tidak terwujud.';
$data['i_understand'] = 'Saya Mengerti';

$data['kyc_not_verified'] = 'Harap selesaikan verifikasi KYC sebelum berinvestasi.';
$data['investment_limit_exceeded'] = 'Investasi harus antara {{min}} dan {{max}}';
$data['payment_method_required'] = 'Harap pilih metode pembayaran.';
$data['payment_error'] = 'Kesalahan Pembayaran';
$data['dismiss'] = 'Tutup';
$data['validation_failed'] = 'Validasi gagal';

$data['projected_returns'] = 'Proyeksi Keuntungan';
$data['expected_return'] = 'Estimasi Keuntungan:';
$data['roi_label'] = 'ROI:';
$data['range_label'] = 'Rentang:';
$data['amount_label_simple'] = 'Jumlah:';

$data['disclaimer_text'] = 'Dengan melanjutkan, Anda mengakui bahwa investasi mengandung risiko dan keuntungan tidak dijamin. Silakan baca';
$data['terms_of_service'] = 'Ketentuan Layanan';
$data['and'] = 'dan';
$data['problems_with_submission'] = 'Ada beberapa masalah dengan kiriman Anda:';

file_put_contents('public/locales/id/investments.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
