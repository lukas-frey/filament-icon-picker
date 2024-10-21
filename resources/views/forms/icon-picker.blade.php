<div {{ $attributes->merge([
    'class' => "filament-icon-picker filament-icon-picker-{$getLayout()}",
])->merge($getColumnsConfig()) }}
x-data="{}"
x-load-css="[@js(\Filament\Support\Facades\FilamentAsset::getStyleHref('filament-icon-picker-stylesheet', package: 'guava/filament-icon-picker'))]"
>
	@include('filament-forms::components.select')
</div>
