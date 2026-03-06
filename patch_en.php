<?php
$json = file_get_contents('public/locales/en/translation.json');
$data = json_decode($json, true);

$data['auth']['forgot_password_instruction'] = 'Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.';
$data['auth']['send_password_reset_link'] = 'Email Password Reset Link';
$data['auth']['confirm_password_instruction'] = 'This is a secure area of the application. Please confirm your password before continuing.';
$data['auth']['verify_email_instruction'] = "Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another.";
$data['auth']['two_factor_auth'] = 'Two-Factor Authentication';
$data['auth']['recovery_code_instruction'] = 'Enter one of your recovery codes to regain access to your account.';
$data['auth']['authenticator_code_instruction'] = 'Enter the 6-digit code from your authenticator app to complete login.';
$data['auth']['authentication_code'] = 'Authentication Code';
$data['auth']['verify'] = 'Verify';
$data['auth']['use_recovery_code'] = 'Use a recovery code';
$data['auth']['recovery_code'] = 'Recovery Code';
$data['auth']['verify_recovery_code'] = 'Verify Recovery Code';
$data['auth']['use_authenticator_code'] = 'Use authenticator code instead';
$data['auth']['already_registered'] = 'Already registered?';

file_put_contents('public/locales/en/translation.json', json_encode($data, JSON_PRETTY_PRINT));
