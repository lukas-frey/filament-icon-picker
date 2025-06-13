<?php

namespace Guava\IconPickerPro\Facades;

use Illuminate\Support\Facades\Facade;

/**
 * @see \Guava\IconPickerPro\IconPickerPro
 */
class IconPickerPro extends Facade
{
    protected static function getFacadeAccessor()
    {
        return \Guava\IconPickerPro\IconPickerPro::class;
    }
}
