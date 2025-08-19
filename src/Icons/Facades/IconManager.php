<?php

namespace Guava\IconPicker\Icons\Facades;

use BladeUI\Icons\Factory;
use Illuminate\Support\Facades\Facade;

/**
 * @see \Guava\IconPicker\Forms\Components\IconPicker
 */
class IconManager extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return \Guava\IconPicker\Icons\IconManager::class;
    }
}
