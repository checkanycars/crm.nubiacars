<?php

namespace App;

enum CustomerStatus: string
{
    case Lead = 'lead';
    case Active = 'active';
    case Inactive = 'inactive';
}
