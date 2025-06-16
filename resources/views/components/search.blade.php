@php
    use function Filament\Support\generate_loading_indicator_html;
@endphp

@props([
    'field',
    'sets',
    'searchPrompt',
])

@php

    @endphp
<div class="flex flex-col gap-4">
    <x-filament::input.wrapper>
        <x-filament::input.select x-bind="setSelect" x-model="set">
            <option value="">All</option>
            @foreach($sets as $set)
                <option value="{{$set->getId()}}">{{$set->label}}</option>
            @endforeach
        </x-filament::input.select>

    </x-filament::input.wrapper>
    <x-filament::input.wrapper>
        <x-filament::input x-bind="searchInput" :placeholder="$searchPrompt"></x-filament::input>
    </x-filament::input.wrapper>

    {{ $field->getSearchResultsViewComponent() }}
</div>
