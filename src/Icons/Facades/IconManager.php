<?php

namespace Guava\IconPickerPro\Icons\Facades;

use BladeUI\Icons\Factory;
use Illuminate\Support\Facades\Facade;

/**
 * @see \Guava\IconPickerPro\Forms\Components\IconPickerPro
 */
class IconManager extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return \Guava\IconPickerPro\Icons\IconManager::class;
    }
}
