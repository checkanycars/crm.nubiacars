<?php

namespace App;

enum LeadCategory: string
{
    case LocalNew = 'local_new';
    case LocalUsed = 'local_used';
    case PremiumExport = 'premium_export';
    case RegularExport = 'regular_export';
    case CommercialExport = 'commercial_export';
}
