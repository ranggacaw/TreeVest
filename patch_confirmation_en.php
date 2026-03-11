<?php

$json = file_get_contents('public/locales/en/investments.json');
$data = json_decode($json, true);

$data['investment_confirmation'] = 'Investment Confirmation';
$data['awaiting_payment_title'] = 'Awaiting Payment';
$data['awaiting_payment_desc'] = 'Please complete your payment to confirm your investment.';
$data['processing_payment_title'] = 'Processing Payment';
$data['processing_payment_desc'] = 'We are processing your payment. This may take a moment.';
$data['investment_confirmed_title'] = 'Investment Confirmed!';
$data['investment_confirmed_desc'] = 'Your investment has been successfully processed.';
$data['payment_failed_title'] = 'Payment Failed';
$data['payment_failed_desc'] = 'There was an issue processing your payment. Please try again.';
$data['investment_id'] = 'Investment ID';
$data['amount'] = 'Amount';
$data['tree'] = 'Tree';
$data['view_my_investments'] = 'View My Investments';
$data['continue_investing'] = 'Continue Investing';
$data['add_payment_method'] = 'Add Payment Method';
$data['view_all_investments'] = 'View All Investments';

file_put_contents('public/locales/en/investments.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
