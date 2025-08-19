@php
    use function Filament\Support\generate_loading_indicator_html;
@endphp

@props([
    'field',
    'sets',
    'searchPrompt',
    'isDropdown' => false,
])

<x-filament::section
    compact
    @class([
        'absolute w-full top-full left-0 mt-2 z-10' => $isDropdown,
    ])
    x-bind="dropdownMenu"
    x-cloak
>
    <div class="flex flex-col gap-4 @container">
        <x-filament::input.wrapper>
            <x-filament::input.select x-bind="setSelect" x-model="set">
                <option value="">@lang('filament-icon-picker::icon-picker.all-icons')</option>
                @foreach($sets as $set)
                    <option value="{{$set->getId()}}">{{$set->label}}</option>
                @endforeach
            </x-filament::input.select>

        </x-filament::input.wrapper>

        <x-filament::input.wrapper>
            <x-filament::input x-bind="searchInput" :placeholder="$searchPrompt"></x-filament::input>
        </x-filament::input.wrapper>

        <x-guava-icon-picker::searching :field="$field" />
        <x-guava-icon-picker::no-results-found :field="$field"/>

        {{ $field->getSearchResultsViewComponent() }}
    </div>
</x-filament::section>
