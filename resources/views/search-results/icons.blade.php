@php
    use function Filament\Support\generate_loading_indicator_html;
@endphp

@props([
    'withTooltips',
])

<div class="grid grid-cols-4 @sm:grid-cols-6 @lg:grid-cols-9 @xl:grid-cols-12 gap-1.5 max-h-64 overflow-scroll p-px" x-ref="searchResultContainer">
    <div x-cloak secondary x-show="isLoading" class="col-span-full flex items-center justify-center bg-gray-50 text-gray-600  p-2 rounded-lg ring-1 ring-gray-950/10 dark:bg-white/5  dark:text-gray-400 dark:ring-white/20">
        <div class="flex flex-row gap-2 items-center text-center">
            {{generate_loading_indicator_html()}}
            <span class="text-gray-500 dark:text-gray-400 mt-auto mb-0">{{$searchingMessage}}</span>
        </div>
    </div>
    <template x-for="icon in resultsVisible" :key="icon.id">
        <div role="button"
             x-intersect="setElementIcon($el, icon.id)"
             class="flex items-center justify-center bg-gray-50 text-gray-600  p-2 rounded-lg ring-1 ring-gray-950/10 dark:bg-white/5  dark:text-gray-400 dark:ring-white/20"
             x-on:click.prevent="updateState(icon)"
             x-bind:class="{
                'bg-primary-500! text-white!': state == icon.id
            }"
             x-show="! isLoading"
             @if($withTooltips)
                 x-tooltip="{
                    content: icon.label,
                    theme: $store.theme,
                 }"
             @endif
        >
            {{generate_loading_indicator_html()}}
        </div>
    </template>
    <div x-intersect="addSearchResultsChunk" class="col-span-full"></div>
</div>
