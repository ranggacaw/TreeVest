<?php

$json = file_get_contents('public/locales/en/investments.json');
$data = json_decode($json, true);

$data['my_investments'] = 'My Investments';
$data['total_investment_value'] = 'Total Investment Value';
$data['total_investments_count'] = 'Total Investments';
$data['no_investments_made'] = "You haven't made any investments yet.";
$data['browse_fruit_trees'] = 'Browse Fruit Trees';
$data['tree_number'] = 'Tree #{{identifier}}';
$data['expected_roi'] = '{{roi}}% expected ROI';
$data['status']['active'] = 'Active';
$data['status']['pending_payment'] = 'Pending Payment';
$data['status']['cancelled'] = 'Cancelled';
$data['status']['completed'] = 'Completed';

file_put_contents('public/locales/en/investments.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
