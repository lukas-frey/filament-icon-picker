@php
    use function Filament\Support\generate_loading_indicator_html;
@endphp

<div class="grid grid-cols-3 gap-2 max-h-96 overflow-scroll p-px">
    <x-filament::section x-cloak secondary x-show="isLoading" class="col-span-full">
        <div class="flex flex-col gap-2 items-center text-center">
            {{generate_loading_indicator_html()}}
            <span class="text-gray-500 dark:text-gray-400 mt-auto mb-0">Searching...</span>
        </div>
    </x-filament::section>
    <template x-for="icon in resultsVisible">
        <x-filament::section role="button"
                             x-on:click.prevent="updateState(icon)"
                             secondary
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
