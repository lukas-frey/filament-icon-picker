@php
    use Filament\Support\Enums\IconSize;
    use Filament\Support\Facades\FilamentAsset;
    use Illuminate\View\ComponentAttributeBag;
    use function Filament\Support\generate_icon_html;
	use function Filament\Support\generate_loading_indicator_html;

    $key = $getKey();
    $statePath = $getStatePath();
	$state = $field->getState();
	$isDropdown = $isDropdown();
	$isDisabled = $isDisabled();
	$shouldCloseOnSelect = $shouldCloseOnSelect();
@endphp

<x-dynamic-component
        :component="$getFieldWrapperView()"
        :field="$field"
>
    <div
            x-load
            x-load-src="{{ FilamentAsset::getAlpineComponentSrc('icon-picker-component', 'guava/filament-icon-picker-pro') }}"
            x-data="iconPickerComponent({
                state: $wire.{{ $applyStateBindingModifiers("\$entangle('{$statePath}')") }},
                isDropdown: @js($isDropdown),
                shouldCloseOnSelect: @js($shouldCloseOnSelect),
                getSetUsing: async(state) => {
                    return await $wire.callSchemaComponentMethod(@js($key), 'getSetJs', { state })
                },
                getIconsUsing: async (set) => {
                    return await $wire.callSchemaComponentMethod(@js($key), 'getIconsJs', { set })
                },
            })"
            {{ $getExtraAttributeBag()
                ->class([
                    'flex flex-col gap-4'
                ])
            }}
    >
        <x-filament::input.wrapper
                x-bind="dropdownTrigger"
                class="w-full relative"
                :disabled="$isDisabled"
                :inline-suffix="true"
                x-bind:class="{
                    '[&_.fi-input-wrp-prefix]:hidden': ! state && ! isLoading,
                    '[&_.fi-input-wrp-suffix]:hidden': ! state,
                }"
        >
            <x-slot:prefix>
                <div x-show="isLoading && !selectedIcon">{{generate_loading_indicator_html()}}</div>
                <div x-html="selectedIcon"></div>
            </x-slot:prefix>

            <x-filament::input readonly x-model="state"/>

            @if(!$isDisabled)
                <x-slot:suffix>
                        {{
                            generate_icon_html(
                                'heroicon-s-x-mark',
                                attributes: (new ComponentAttributeBag())
                                    ->merge([
                                        'x-on:click.prevent.stop' => 'updateState(null)'
                                    ])
                                    ->class([
                                        'opacity-50 text-black dark:text-white m-auto hover:cursor-pointer'
                                    ])
                        )}}
                </x-slot:suffix>
            @endif

            @if($isDropdown && !$isDisabled)
                <x-guava-icon-picker::search :field="$field"
                                             :sets="$getSets()"
                                             :search-prompt="$getSearchPrompt()"
                                             :is-dropdown="$isDropdown"
                />
            @endif
        </x-filament::input.wrapper>

        @if(! $isDropdown && ! $isDisabled)
            <x-guava-icon-picker::search :field="$field"
                                         :sets="$getSets()"
                                         :search-prompt="$getSearchPrompt()"
                                         :is-dropdown="$isDropdown"
            />
        @endif
    </div>
</x-dynamic-component>
