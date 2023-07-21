<div class="flex flex-col items-center justify-center">
	<div class="relative w-full !h-16 flex flex-col items-center justify-center py-2">
		<div class="relative w-12 h-12 grow-1 shrink-0 gap-1">
			<x-filament::icon
{{--				alias="filament-icon-picker::topbar.global-search.field"--}}
				icon="{{$icon}}"
				class="w-full h-full absolute"
			/>
			{{-- Ugly fix for choices.js not registering clicks on SVGs. --}}
			<div class="w-full h-full absolute z-10"></div>
		</div>
		<small class="w-full text-center grow-0 shrink-0 h-4 truncate">{{$icon}}</small>
	</div>
</div>
