<?php

namespace Guava\FilamentIconPicker;

use Filament\Support\Assets\Css;
use Filament\Support\Facades\FilamentAsset;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class FilamentIconPickerServiceProvider extends PackageServiceProvider
{
    public function configurePackage(Package $package): void
    {
        $package
            ->name('filament-icon-picker')
            ->hasViews()
            ->hasConfigFile('icon-picker');
    }

    public function packageRegistered(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/icon-picker.php', 'filament-icon-picker');

        FilamentAsset::register([
            Css::make('icon-picker-stylesheet', __DIR__ . '/../resources/css/plugin.css'),
        ], package: 'guava/filament-icon-picker');
    }
}
