@php
    use function Filament\Support\generate_loading_indicator_html;
@endphp

<div class="grid grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 @2xl:grid-cols-6 gap-2 max-h-96 overflow-scroll p-px">
    <x-filament::section x-cloak secondary x-show="isLoading" class="col-span-full">
        <div class="flex flex-col gap-2 items-center text-center">
            {{generate_loading_indicator_html()}}
            <span class="text-gray-500 dark:text-gray-400 mt-auto mb-0">{{$searchingMessage}}</span>
        </div>
    </x-filament::section>
    <template x-if="! isLoading && (icons.length === 0 || resultsVisible.length === 0)">
        <x-filament::section secondary class="col-span-full">
            <div class="flex flex-col gap-2 items-center text-center">
                <span class="text-gray-500 dark:text-gray-400 mt-auto mb-0">No results found</span>

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
    <template x-for="icon in resultsVisible">
        <x-filament::section role="button"
                             x-on:click.prevent="updateState(icon)"
                             secondary
                             x-show="!isLoading"
                             x-bind:class="{
                                'bg-primary-500! text-white!': state == icon.id
                             }"
        >
            <div class="flex flex-col gap-2 items-center text-center">
                <div x-html="icon.html"></div>
                <span class="text-gray-500 dark:text-gray-400 mt-auto mb-0"
                      x-bind:class="{
                        'text-white!': state == icon.id
                      }"
                      x-text="icon.label"></span>
            </div>
        </x-filament::section>
    </template>
    <div x-intersect="addSearchResultsChunk" class="col-span-full"></div>
</div>
