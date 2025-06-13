# This is the pro version of the popular icon picker plugin

[![Latest Version on Packagist](https://img.shields.io/packagist/v/guava/filament-icon-picker-pro.svg?style=flat-square)](https://packagist.org/packages/guava/filament-icon-picker-pro)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/guava/filament-icon-picker-pro/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/guava/filament-icon-picker-pro/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/guava/filament-icon-picker-pro/fix-php-code-styling.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/guava/filament-icon-picker-pro/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/guava/filament-icon-picker-pro.svg?style=flat-square)](https://packagist.org/packages/guava/filament-icon-picker-pro)



This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require guava/filament-icon-picker-pro
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="filament-icon-picker-pro-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-icon-picker-pro-config"
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="filament-icon-picker-pro-views"
```

This is the contents of the published config file:

```php
return [
];
```

## Usage

```php
$iconPickerPro = new Guava\IconPickerPro();
echo $iconPickerPro->echoPhrase('Hello, Guava!');
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Lukas Frey](https://github.com/GuavaCZ)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
