<?php

namespace Guava\FilamentIconPicker;
use Filament\PluginServiceProvider;
use Spatie\LaravelPackageTools\Package;

class FilamentIconPickerServiceProvider extends PluginServiceProvider
{
    protected array $styles = [
        'filament-icon-picker-styles' => __DIR__ . '/../dist/plugin.css',
    ];

    public function configurePackage(Package $package): void
    {
        $package
            ->name('filament-icon-picker')
            ->hasViews()
            ->hasConfigFile('icon-picker')
        ;
    }

}
