<div {{ $attributes->merge([
    'class' => "filament-icon-picker filament-icon-picker-{$getLayout()}",
])->merge($getColumns()) }}>
	@include('filament-forms::components.select')
</div>
