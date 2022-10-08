# Filament Icon Picker

[![Latest Version on Packagist](https://img.shields.io/packagist/v/guava/filament-icon-picker.svg?style=flat-square)](https://packagist.org/packages/guava/filament-icon-picker)
[![Total Downloads](https://img.shields.io/packagist/dt/guava/filament-icon-picker.svg?style=flat-square)](https://packagist.org/packages/guava/filament-icon-picker)

[//]: # ([![GitHub Tests Action Status]&#40;https://img.shields.io/github/workflow/status/:vendor_slug/:package_slug/run-tests?label=tests&#41;]&#40;https://github.com/:vendor_slug/:package_slug/actions?query=workflow%3Arun-tests+branch%3Amain&#41;)
[//]: # ([![GitHub Code Style Action Status]&#40;https://img.shields.io/github/workflow/status/LukasFreyCZ/filament-icon-picker/Check%20&%20fix%20styling?label=code%20style&#41;]&#40;https://github.com/LukasFreyCZ/filament-icon-picker/actions?query=workflow%3A"Check+%26+fix+styling"+branch%3Amain&#41;)

This plugin adds a new icon picker form field. You can use it to select from any blade-icons kit that you have installed. By default, heroicons are supported since it is shipped with Filament.

This can be useful for when you want to customize icons rendered on your frontend, if you want your users to be able to customize navigation icons, add small icons to their models for easy recognition and similar.



https://user-images.githubusercontent.com/10926334/194676916-446eb432-c859-4f94-bf52-2b1ee4416a93.mov



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

### Basic Usage
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

### Options

#### Columns
By default, a single-column icon picker will be displayed.
You can customize the amount of columns using `->columns()` like this:
```php
// Display 3 columns from lg and above
IconPicker::make('icon')
    ->columns(3); 
    
// More detailed customization
// This will display 1 column from xs to md, 3 columns from lg to xl and 5 columns from 2xl and above
IconPicker::make('icon')
    ->columns([
        'default' => 1,
        'lg' => 3,
        '2xl' => 5,
    ]);
```
1 Column             |  3 Columns
:-------------------------:|:-------------------------:
<img width="500" alt="image" src="https://user-images.githubusercontent.com/10926334/194676645-4e8e14bf-e7a6-4e34-aab2-ae72364e7529.png"> | <img width="500" alt="image" src="https://user-images.githubusercontent.com/10926334/194676682-c29d0f46-8bf8-412b-84b5-98509e411202.png">



#### Sets
By default, the plugin will use the heroicons set. If you have installed [additional icon sets](https://github.com/blade-ui-kit/blade-icons#icon-packages), you add them using this option:
```php
// Search both herocions and fontawesome icons
IconPicker::make('icon')
    ->sets(['heroicons', 'fontawesome-solid']); 
```


#### Allow/Disallow icons
For detailed control over the icons, there are two options available to allow and disallow certain icons.
```php
// Allow ONLY heroicon-o-user and heroicon-o-users
// Allow ALL fontawesome icons, EXCEPT fas-user
IconPicker::make('icon')
    ->allowIcons(['heroicon-o-user', 'heroicon-o-users'])
    ->disallowIcons(['fas-user']); 
```


#### Layout
The icon picker comes with two layouts. The default, `Layout::FLOATING` is the standard layout used in Filament Selects.  The search results will appear in a pop over window.

The `Layout::ON_TOP` will render the search results always on the page.

```php
// 
IconPicker::make('icon')
    ->layout(Layout::FLOATING) // default
    //or
    ->layout(Layout::ON_TOP)
```

#### Custom Item Template
Out of the box, the search results render a preview of the icon and their identifier.
You are free to customize this using the `->itemTemplate()` option:

```php
// Render your.blade.template instead of the default template.  
// Make sure to pass the $icon as parameter to be able to render it in your view.
IconPicker::make('icon')
    ->itemTemplate(fn($icon) => view('your.blade.template', ['icon' => $icon]));
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
