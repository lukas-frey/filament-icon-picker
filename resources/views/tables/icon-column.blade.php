<div class="filament-icon-picker-icon-column px-4 py-3"
x-data="{}"
x-load-css="[@js(\Filament\Support\Facades\FilamentAsset::getStyleHref('filament-icon-picker-stylesheet', package: 'guava/filament-icon-picker'))]"
>
	@if($icon = $getState())
		<x-icon class="h-6" name="{{$icon}}" />
	@endif
</div>
