# This is the pro version of the popular icon picker plugin

[![Latest Version on Packagist](https://img.shields.io/packagist/v/guava/filament-icon-picker-pro.svg?style=flat-square)](https://packagist.org/packages/guava/filament-icon-picker-pro)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/guava/filament-icon-picker-pro/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/guava/filament-icon-picker-pro/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/guava/filament-icon-picker-pro/fix-php-code-styling.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/guava/filament-icon-picker-pro/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/guava/filament-icon-picker-pro.svg?style=flat-square)](https://packagist.org/packages/guava/filament-icon-picker-pro)



This plugin adds a new icon picker form field and a corresponding table column. You can use it to select from any blade-icons kit that you have installed. By default, heroicons are supported since it is shipped with Filament.

This can be useful for when you want to customize icons rendered on your frontend, if you want your users to be able to customize navigation icons, add small icons to their models for easy recognition and similar.

## Installation

You can install the package via composer:

**Filament v4:**
```bash
composer require guava/filament-icon-picker:"^3.0"
```

Make sure to publish the package assets using:

```bash
php artisan filament:assets
```

Finally, make sure you have a **custom filament theme** (read [here](https://filamentphp.com/docs/4.x/styling/overview#creating-a-custom-theme) how to create one) and add the following to your **theme.css** file:

This ensures that the CSS is properly built:
```css
@source '../../../../vendor/guava/filament-icon-picker/resources/**/*';
```

For older filament versions, please check the branch of the respective version.

## Usage

### Usage in Schemas:
Add the icon picker to any form schema in your filament panel or livewire component that supports filament forms:
```php
use Guava\IconPicker\Forms\Components\IconPicker;

IconPicker::make('icon');
```

### Usage in Tables:
To display the stored icon in your filamen tables, use our IconColumn class:

```php
// Make sure this is the correct import, not the filament one
use Guava\IconPicker\Tables\Columns\IconColumn;

$table
    ->columns([
        IconColumn::make('icon'),
    ])
    // ...
;
```

### Usage on the frontend:
We store the full icon name in the database. This means to use the icon on the frontend, simply treat is as any other static icon.

For example, assuming we saved the icon on our `$category` model under `$icon`, you can render it in your blade view using:
```php
<x-icon :name="$category->icon" />
```
More information on rendering the icon on the [blade-icons github](https://github.com/blade-ui-kit/blade-icons#default-component).

## Customization

### Search Results View
Out of the box, we provide three different search result views that you can choose from.

#### Grid View
This is the default view used. Icons will be shown in a grid with their name underneath the icon.

```php
IconPicker::make('icon')
    ->gridSearchResults();
```

<img width="410" height="598" alt="Screenshot 2025-08-19 at 14 12 10" src="https://github.com/user-attachments/assets/78965823-03b7-48b4-9347-58e1ba693530" />



#### List View
Icons will be rendered in a list together with the icon's name.

```php
IconPicker::make('icon')
    ->listSearchResults();
```

<img width="414" height="594" alt="Screenshot 2025-08-19 at 14 12 27" src="https://github.com/user-attachments/assets/1ff12789-91fd-4587-aec5-c40bbb089a4f" />


#### Icons View
Icons will be rendered in a small grid with only the icons visible, optionally configurable to show a tooltip with the icon name.

```php
IconPicker::make('icon')
    ->iconsSearchResults()       // With tooltip
    ->iconsSearchResults(false); // Without tooltip
```

<img width="417" height="477" alt="Screenshot 2025-08-19 at 14 12 48" src="https://github.com/user-attachments/assets/42a4a50c-3495-4b7f-a9ed-94e3e8b23867" />


### Dropdown
By default, the icon picker will open a dropdown, where you can search and select the icon. (Very similar to a regular `Select` field in filament).

If you prefer, you can disable the dropdown and then the search and results will be rendered directly beneath the field.

```php
IconPicker::make('icon')
    ->dropdown(false);
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
