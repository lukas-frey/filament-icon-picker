# Filament Icon Picker

[![Latest Version on Packagist](https://img.shields.io/packagist/v/guava/filament-icon-picker.svg?style=flat-square)](https://packagist.org/packages/guava/filament-icon-picker)
[![Total Downloads](https://img.shields.io/packagist/dt/guava/filament-icon-picker.svg?style=flat-square)](https://packagist.org/packages/guava/filament-icon-picker)

[//]: # ([![GitHub Tests Action Status]&#40;https://img.shields.io/github/workflow/status/:vendor_slug/:package_slug/run-tests?label=tests&#41;]&#40;https://github.com/:vendor_slug/:package_slug/actions?query=workflow%3Arun-tests+branch%3Amain&#41;)
[//]: # ([![GitHub Code Style Action Status]&#40;https://img.shields.io/github/workflow/status/LukasFreyCZ/filament-icon-picker/Check%20&%20fix%20styling?label=code%20style&#41;]&#40;https://github.com/LukasFreyCZ/filament-icon-picker/actions?query=workflow%3A"Check+%26+fix+styling"+branch%3Amain&#41;)

This plugin adds a new icon picker form field. You can use it to select from any blade-icons kit that you have installed. By default, heroicons are supported since it is shipped with Filament.

## Installation

You can install the package via composer:

```bash
composer require guava/filament-icon-picker
```

[//]: # ()
[//]: # (You can publish the config file with:)

[//]: # ()
[//]: # (```bash)

[//]: # (php artisan vendor:publish --tag=":package_slug-config")

[//]: # (```)

[//]: # (Optionally, you can publish the views using)

[//]: # ()
[//]: # (```bash)

[//]: # (php artisan vendor:publish --tag=":package_slug-views")

[//]: # (```)

[//]: # (This is the contents of the published config file:)

[//]: # ()
[//]: # (```php)

[//]: # (return [)

[//]: # (];)

[//]: # (```)

## Usage

Usage in Admin Panel:
```php
use Guava\FilamentIconPicker\Forms\IconPicker;

public static function form(Form $form): Form
{
    return $form->schema([
        IconPicker::make('icon');
    ]);
}
```


Usage in Livewire Component:
```php
use Guava\FilamentIconPicker\Forms\IconPicker;

protected function getFormSchema(): array
{
    return [
        IconPicker::make('icon'),
    ];
}
```

[//]: # (## Testing)

[//]: # ()
[//]: # (```bash)

[//]: # (composer test)

[//]: # (```)

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Lukas Frey](https://github.com/LukasFreyCZ)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
