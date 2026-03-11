<?php

$json = file_get_contents('public/locales/en/investments.json');
$data = json_decode($json, true);

$data['invest_in_tree'] = 'Invest in Tree #{{identifier}}';
$data['configure_investment'] = 'Configure Investment';
$data['investment_amount'] = 'Investment Amount';
$data['amount_label'] = 'Amount ({{formatted}})';
$data['or_enter_custom_amount'] = 'Or enter custom amount (in cents)';
$data['amount_in_cents_placeholder'] = 'Enter amount in cents';
$data['valid_amount_message'] = 'Investment amount is within the valid range.';
$data['invalid_amount_message'] = 'Please enter a valid investment amount.';
$data['acceptance_risk_disclosure_text'] = 'I have read and understand the';
$data['risk_disclosure_link'] = 'risk disclosure';
$data['acceptance_terms_text'] = 'I agree to the';
$data['terms_and_conditions_link'] = 'terms and conditions';
$data['payment_method_label'] = 'Payment Method';
$data['select_payment_method'] = 'Select a payment method';
$data['no_payment_methods'] = 'No payment methods available.';
$data['add_payment_method'] = 'Add a payment method';
$data['processing_button'] = 'Processing...';
$data['proceed_to_payment'] = 'Proceed to Payment';
$data['confirm_investment'] = 'Confirm Investment';
$data['cancel_button'] = 'Cancel';

$data['risk_modal_title'] = 'Risk Disclosure';
$data['risk_modal_intro'] = 'Investing in fruit trees involves significant risks including but not limited to:';
$data['risk_climate'] = 'Climate and weather-related risks affecting crop yields';
$data['risk_market'] = 'Market price fluctuations for fruits';
$data['risk_pest'] = 'Pest and disease risks';
$data['risk_natural_disaster'] = 'Natural disasters affecting farms';
$data['risk_regulatory'] = 'Regulatory changes affecting agricultural operations';
$data['risk_operator'] = 'Farm operator performance risks';
$data['risk_modal_outro'] = 'Past performance does not guarantee future results. The expected ROI is based on historical data and projections, which may not be realized.';
$data['i_understand'] = 'I Understand';

$data['kyc_not_verified'] = 'Please complete KYC verification before investing.';
$data['investment_limit_exceeded'] = 'Investment must be between {{min}} and {{max}}';
$data['payment_method_required'] = 'Please select a payment method.';
$data['payment_error'] = 'Payment Error';
$data['dismiss'] = 'Dismiss';
$data['validation_failed'] = 'Validation failed';

$data['projected_returns'] = 'Projected Returns';
$data['expected_return'] = 'Expected Return:';
$data['roi_label'] = 'ROI:';
$data['range_label'] = 'Range:';
$data['amount_label_simple'] = 'Amount:';

$data['disclaimer_text'] = 'By proceeding, you acknowledge that investments carry risk and returns are not guaranteed. Please read our';
$data['terms_of_service'] = 'Terms of Service';
$data['and'] = 'and';
$data['problems_with_submission'] = 'There were some problems with your submission:';

file_put_contents('public/locales/en/investments.json', json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
