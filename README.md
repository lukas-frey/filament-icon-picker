![icon_picker_banner](https://user-images.githubusercontent.com/10926334/194752395-677e25f6-2878-4652-a95f-ef9c4392c093.png)

# Filament Icon Picker

[![Latest Version on Packagist](https://img.shields.io/packagist/v/guava/filament-icon-picker.svg?style=flat-square)](https://packagist.org/packages/guava/filament-icon-picker)
![Packagist PHP Version](https://img.shields.io/packagist/dependency-v/guava/filament-icon-picker/php?style=flat-square)
[![Total Downloads](https://img.shields.io/packagist/dt/guava/filament-icon-picker.svg?style=flat-square)](https://packagist.org/packages/guava/filament-icon-picker)

[//]: # ([![GitHub Tests Action Status]&#40;https://img.shields.io/github/workflow/status/:vendor_slug/:package_slug/run-tests?label=tests&#41;]&#40;https://github.com/:vendor_slug/:package_slug/actions?query=workflow%3Arun-tests+branch%3Amain&#41;)
[//]: # ([![GitHub Code Style Action Status]&#40;https://img.shields.io/github/workflow/status/LukasFreyCZ/filament-icon-picker/Check%20&%20fix%20styling?label=code%20style&#41;]&#40;https://github.com/LukasFreyCZ/filament-icon-picker/actions?query=workflow%3A"Check+%26+fix+styling"+branch%3Amain&#41;)

This plugin adds a new icon picker form field and a corresponding table column. You can use it to select from any blade-icons kit that you have installed. By default, heroicons are supported since it is shipped with Filament.

This can be useful for when you want to customize icons rendered on your frontend, if you want your users to be able to customize navigation icons, add small icons to their models for easy recognition and similar.



https://user-images.githubusercontent.com/10926334/194676916-446eb432-c859-4f94-bf52-2b1ee4416a93.mov



## Installation

You can install the package via composer:

```bash
composer require guava/filament-icon-picker
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-icon-picker-config"
```

This is the contents of the published config file:

```php

<?php
return [

    'sets' => null,

    'columns' => 1,

    'layout' => \Guava\FilamentIconPicker\Layout::FLOATING,
    
    'cache' => [
        'enabled' => true,
        'duration' => '7 days',
    ],

];


```

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


Usage in Tables:
```php
// Make sure this is the correct import, not the filament one
use Guava\FilamentIconPicker\Tables\IconColumn;

public static function table(Table $table): Table
{
    return $table
        ->columns([
            IconColumn::make('icon'),
        ])
        // ...
        ;
}
```

The field's state returns the selected identifier of the icon.

Assuming we saved the icon on our `$category` model under `$icon`, you can render it in your blade view using:
```php
<x-icon name="{{ $category->icon }}" />
```
More information on rendering the icon on the [blade-icons github](https://github.com/blade-ui-kit/blade-icons#default-component).

### Options

#### Columns
By default, a single-column icon picker will be displayed.
You can customize the amount of columns via the `icon-picker.columns` configuration or using the `->columns()` option like this:
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
By default, the plugin will use all available [blade icon sets](https://github.com/blade-ui-kit/blade-icons#icon-packages) installed. If you want to use only specific icon sets, you can change the default via the `icon-picker.sets` configuration or on a case-by-case basis:
```php
// Search both herocions and fontawesome icons
IconPicker::make('icon')
    ->sets(['heroicons', 'fontawesome-solid']); 
```

**When installing new sets, please make sure to clear your cache, if you can't find your icons in the icon picker.**


#### Allow/Disallow icons
For detailed control over the icons, there are two options available to allow and disallow certain icons.
```php
// Allow ONLY heroicon-o-user and heroicon-o-users
IconPicker::make('icon')
    ->allowIcons(['heroicon-o-user', 'heroicon-o-users']);
```

```php
// Allow ALL fontawesome icons, EXCEPT fas-user
IconPicker::make('icon')
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

#### Caching
Depending on how many icon packs you use and their size, the loading time
for getting the search results can be high. In order to mitigate this
issue a bit, search results are by default cached (for 7 days).

You can configure the default caching options for all icon pickers in the configuration file.

To configure a specific IconPicker, these methods are available:
```php
IconPicker::make('icon')
    // Disable caching
    ->cacheable(false)
    
    // Cache for one hour
    ->cacheDuration(3600);
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

## Other packages
- [Laravel Populator](https://github.com/GuavaCZ/laravel-populator)
- [Filament Drafts](https://github.com/GuavaCZ/filament-drafts)
