<div {{ $attributes->merge([
    'class' => "filament-icon-picker filament-icon-picker-{$getLayout()->value}",
    ...$getColumnsConfig()
]) }}>
	@include('forms::components.select')
</div>
