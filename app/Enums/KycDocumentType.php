<?php

namespace App\Enums;

enum KycDocumentType: string
{
    case PASSPORT = 'passport';
    case NATIONAL_ID = 'national_id';
    case DRIVERS_LICENSE = 'drivers_license';
    case PROOF_OF_ADDRESS = 'proof_of_address';
}
