@php
    use function Filament\Support\generate_loading_indicator_html;
@endphp

<div class="grid grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 @2xl:grid-cols-6 gap-2 max-h-96 overflow-scroll p-px">
    <template x-for="icon in resultsVisible" :key="icon.id">
        <div role="button"
             class="bg-gray-50 text-gray-600 rounded-lg ring-1 ring-gray-950/10 dark:bg-white/5  dark:text-gray-400 dark:ring-white/20 p-4 flex flex-col items-center text-center gap-2"
             x-show="! isLoading"
             x-on:click.prevent="updateState(icon)"
             x-bind:class="{
                'bg-primary-500! dark:bg-primary-600! text-white!': state == icon.id
            }"
        >
            <div x-intersect="setElementIcon($el, icon.id)">{{generate_loading_indicator_html()}}</div>
            <span class="text-gray-500 dark:text-gray-400 my-auto"
                  x-bind:class="{
                        'text-white!': state == icon.id
                      }"
                  x-text="icon.label"></span>
        </div>
    </template>
    <div x-intersect="addSearchResultsChunk" class="col-span-full"></div>
</div>
