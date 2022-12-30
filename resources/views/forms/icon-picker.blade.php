<div {{ $attributes->merge([
    'class' => "filament-icon-picker filament-icon-picker-{$getLayout()}",
])->merge($getColumnsConfig()) }}>
	@include('filament-forms::components.select')
</div>
