@php
    use function Filament\Support\generate_loading_indicator_html;
@endphp

@props([
    'field'
])

<template x-if="! isLoading && (icons.length === 0 || resultsVisible.length === 0)">
    <x-filament::section secondary class="col-span-full">
        <div class="flex flex-col gap-2 items-center text-center">
            <span class="text-gray-500 dark:text-gray-400 mt-auto mb-0">{{$field->getNoSearchResultsMessage()}}</span>

            @if($field->isCustomIconsUploadEnabled())
                <x-filament::link
                    wire:click.prevent="mountAction('upload-custom-icon', {}, {'schemaComponent': '{{$field->getKey()}}'})"
                    :icon="$field->getCustomIconsUploadAction()->getIcon()"
                >
                    {{$field->getCustomIconsUploadAction()->getLabel()}}
                </x-filament::link>
            @endif
        </div>
    </x-filament::section>
</template>
