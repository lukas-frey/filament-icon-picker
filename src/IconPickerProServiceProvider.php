<?php

namespace Guava\IconPickerPro;

use BladeUI\Icons\Factory as IconFactory;
use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Assets\Asset;
use Filament\Support\Assets\Css;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;
use Filament\Support\Facades\FilamentIcon;
use Guava\IconPickerPro\Commands\IconPickerProCommand;
use Guava\IconPickerPro\Icons\Facades\IconManager;
use Guava\IconPickerPro\Testing\TestsIconPickerPro;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Blade;
use Livewire\Features\SupportTesting\Testable;
use Spatie\LaravelPackageTools\Commands\InstallCommand;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;
use Storage;

class IconPickerProServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-icon-picker-pro';

    public static string $viewNamespace = 'guava-icon-picker';

    public function configurePackage(Package $package): void
    {
        /*
         * This class is a Package Service Provider
         *
         * More info: https://github.com/spatie/laravel-package-tools
         */
        $package->name(static::$name)
            ->hasCommands($this->getCommands())
            ->hasInstallCommand(function (InstallCommand $command) {
                $command
                    ->publishConfigFile()
                    ->publishMigrations()
                    ->askToRunMigrations()
                    ->askToStarRepoOnGitHub('guava/filament-icon-picker-pro');
            });

        $configFileName = $package->shortName();

        if (file_exists($package->basePath("/../config/{$configFileName}.php"))) {
            $package->hasConfigFile();
        }

        if (file_exists($package->basePath('/../database/migrations'))) {
            $package->hasMigrations($this->getMigrations());
        }

        if (file_exists($package->basePath('/../resources/lang'))) {
            $package->hasTranslations();
        }

        if (file_exists($package->basePath('/../resources/views'))) {
            $package->hasViews(static::$viewNamespace);
//            $package->hasViewComponent('ipp', 'components.icon-search');
//            Blade::component('ipp::icon-search', 'components.icon-search');
        }
    }

    public function packageRegistered(): void
    {
        $this->callAfterResolving(IconFactory::class, function (IconFactory $factory) {
            Storage::disk('public')->makeDirectory('icon-picker-pro-icons');

            $factory->add('icon-picker-pro-icons', [
                'path' => 'icon-picker-pro-icons',
                'disk' => 'public',
                'prefix' => '_ipp_icons',
            ]);
        });

        //        dd(IconManager::getSets());
        //        dd(IconManager::getSets()['heroicons']->getIcons());
        //        dd(IconManager::getSets()['icon-picker-pro-icons']->getIcons());
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

        // Handle Stubs
        if (app()->runningInConsole()) {
            foreach (app(Filesystem::class)->files(__DIR__ . '/../stubs/') as $file) {
                $this->publishes([
                    $file->getRealPath() => base_path("stubs/filament-icon-picker-pro/{$file->getFilename()}"),
                ], 'filament-icon-picker-pro-stubs');
            }
        }

        // Testing
        Testable::mixin(new TestsIconPickerPro);
    }

    protected function getAssetPackageName(): ?string
    {
        return 'guava/filament-icon-picker-pro';
    }

    /**
     * @return array<Asset>
     */
    protected function getAssets(): array
    {
        return [
            AlpineComponent::make('icon-picker-component', __DIR__ . '/../resources/dist/components/icon-picker-component.js'),
            //            Css::make('filament-icon-picker-pro-styles', __DIR__ . '/../resources/dist/filament-icon-picker-pro.css'),
            //            Js::make('filament-icon-picker-pro-scripts', __DIR__ . '/../resources/dist/filament-icon-picker-pro.js'),
        ];
    }

    /**
     * @return array<class-string>
     */
    protected function getCommands(): array
    {
        return [
            IconPickerProCommand::class,
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
     * @return array<string>
     */
    protected function getRoutes(): array
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

    /**
     * @return array<string>
     */
    protected function getMigrations(): array
    {
        return [
            'create_filament-icon-picker-pro_table',
        ];
    }
}
