<?php

namespace Guava\FilamentIconPicker;
use Filament\PluginServiceProvider;
use Spatie\LaravelPackageTools\Package;

class FilamentIconPickerServiceProvider extends PluginServiceProvider
{

    public function configurePackage(Package $package): void
    {
        $package->name('Filament Icon Picker');
    }

}
