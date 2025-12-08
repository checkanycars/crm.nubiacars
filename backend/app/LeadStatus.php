<?php

namespace App;

enum LeadStatus: string
{
    case New = 'new';
    case Contacted = 'contacted';
    case Converted = 'converted';
    case NotConverted = 'not_converted';
}
