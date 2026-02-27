<?php

namespace App\Enums;

enum LegalDocumentType: string
{
    case TERMS_OF_SERVICE = 'terms_of_service';
    case PRIVACY_POLICY = 'privacy_policy';
    case INVESTMENT_DISCLAIMER = 'investment_disclaimer';
    case RISK_DISCLOSURE = 'risk_disclosure';
}
