<div class="filament-icon-picker-icon-column px-4 py-3">
{{--	<x-icon class="h-6" name="{{$getState()}}" />--}}
	@if($getState)
        @svg($getState(), ['class' => 'h-6'])
	@endif 
</div>
