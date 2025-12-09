<?php

namespace App;

enum UserRole: string
{
    case Manager = 'manager';
    case Sales = 'sales';
    case Finance = 'finance';
}
