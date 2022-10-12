<div {{ $attributes->merge([
    'class' => "filament-icon-picker filament-icon-picker-{$getLayout()}",
    ...$getColumnsConfig()
]) }}>
	@include('forms::components.select')
</div>
