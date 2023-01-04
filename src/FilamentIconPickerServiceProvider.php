<?php

namespace Guava\FilamentIconPicker;
use Filament\FilamentServiceProvider;
//use Filament\Support\PluginServiceProvider;
use Spatie\LaravelPackageTools\Package;

class FilamentIconPickerServiceProvider extends FilamentServiceProvider
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
