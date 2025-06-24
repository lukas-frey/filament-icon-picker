@php
    use function Filament\Support\generate_loading_indicator_html;
@endphp

@props([
    'field'
])

<x-filament::section x-cloak secondary x-show="isLoading" class="col-span-full">
    <div class="flex flex-col gap-2 items-center text-center">
        {{generate_loading_indicator_html()}}
        <span class="text-gray-500 dark:text-gray-400 mt-auto mb-0">{{$field->getSearchingMessage()}}</span>
    </div>
</x-filament::section>
