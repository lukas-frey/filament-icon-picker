<?php

namespace Guava\IconPicker;

use BladeUI\Icons\Factory as IconFactory;
use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Assets\Asset;
use Filament\Support\Assets\Css;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;
use Filament\Support\Facades\FilamentIcon;
use Guava\IconPicker\Testing\TestsIconPicker;
use Livewire\Features\SupportTesting\Testable;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;
use Storage;

class IconPickerServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-icon-picker';

    public static string $viewNamespace = 'guava-icon-picker';

    public function configurePackage(Package $package): void
    {
        /*
         * This class is a Package Service Provider
         *
         * More info: https://github.com/spatie/laravel-package-tools
         */
        $package->name(static::$name);

        if (file_exists($package->basePath('/../resources/lang'))) {
            $package->hasTranslations();
        }

        if (file_exists($package->basePath('/../resources/views'))) {
            $package->hasViews(static::$viewNamespace);
        }
    }

    public function packageRegistered(): void
    {
        $this->callAfterResolving(IconFactory::class, function (IconFactory $factory) {
            Storage::disk('public')->makeDirectory('icon-picker-icons');

            $factory->add('icon-picker-icons', [
                'path' => 'icon-picker-icons',
                'disk' => 'public',
                'prefix' => '_gfic_icons',
            ]);
        });
    }

    public function packageBooted(): void
    {
        // Asset Registration
        FilamentAsset::register(
            $this->getAssets(),
            $this->getAssetPackageName()
        );

        FilamentAsset::registerScriptData(
            $this->getScriptData(),
            $this->getAssetPackageName()
        );

        // Icon Registration
        FilamentIcon::register($this->getIcons());

        // Testing
        Testable::mixin(new TestsIconPicker);
    }

    protected function getAssetPackageName(): ?string
    {
        return 'guava/filament-icon-picker';
    }

    /**
     * @return array<Asset>
     */
    protected function getAssets(): array
    {
        return [
            AlpineComponent::make('icon-picker-component', __DIR__ . '/../resources/dist/components/icon-picker-component.js'),
        ];
    }

    /**
     * @return array<string>
     */
    protected function getIcons(): array
    {
        return [];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getScriptData(): array
    {
        return [];
    }
}
