@php
    use function Filament\Support\generate_loading_indicator_html;
@endphp

<div class="flex flex-col gap-2 max-h-96 overflow-scroll p-px">
    <template x-for="icon in resultsVisible" :key="icon.id">
        <div role="button"
             class="bg-gray-50 text-gray-600 p-2 rounded-lg ring-1 ring-gray-950/10 dark:bg-white/5  dark:text-gray-400 dark:ring-white/20"
             x-show="! isLoading"
             x-on:click.prevent="updateState(icon)"
             x-bind:class="{
                'bg-primary-500! dark:bg-primary-600! text-white!': state == icon.id
            }"
        >
            <div class="flex flex-row gap-2 items-center text-center">
                <div x-intersect="setElementIcon($el, icon.id)">{{generate_loading_indicator_html()}}</div>
                <span class="text-gray-500 dark:text-gray-400 mt-auto mb-0"
                      x-bind:class="{
                        'text-white!': state == icon.id
                      }"
                      x-text="icon.label"
                ></span>
            </div>
        </div>
    </template>
    <div x-intersect="addSearchResultsChunk" class="col-span-full"></div>
</div>
