<div {{ $attributes->merge([
    'class' => "filament-icon-picker filament-icon-picker-{$getLayout()}",
])->merge($getColumnsConfig()) }}>
	@include('forms::components.select')
</div>
