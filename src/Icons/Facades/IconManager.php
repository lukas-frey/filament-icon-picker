<?php

namespace Guava\IconPicker\Icons\Facades;

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
