<?php

namespace App;

enum LeadStatus: string
{
    case New = 'new';
    case Converted = 'converted';
    case NotConverted = 'not_converted';
}
