@php
    use Filament\Support\Icons\Heroicon;
    use function Filament\Support\generate_icon_html;
    use function Filament\Support\generate_loading_indicator_html;
@endphp

@props([
    'withTooltips',
])

<div class="grid grid-cols-4 @sm:grid-cols-6 @lg:grid-cols-9 @xl:grid-cols-12 gap-1.5 max-h-64 overflow-scroll p-px"
     x-ref="searchResultContainer">
    <template x-for="icon in resultsVisible" :key="icon.id">
        <div class="relative">
            <div role="button"
                 x-intersect="setElementIcon($el, icon.id)"
                 class="flex items-center justify-center bg-gray-50 text-gray-600  p-2 rounded-lg ring-1 ring-gray-950/10 dark:bg-white/5  dark:text-gray-400 dark:ring-white/20"
                 x-on:click.prevent="updateState(icon)"
                 x-bind:class="{
                'bg-primary-500! dark:bg-primary-600! text-white!': state == icon.id
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
            <x-filament::icon-button
                x-show="icon.custom"
                :icon="Heroicon::XMark"
                class="absolute top-0 right-0"
                color="danger"
                size="xs"
            />
        </div>
    </template>
    <div x-intersect="addSearchResultsChunk" class="col-span-full"></div>
</div>
