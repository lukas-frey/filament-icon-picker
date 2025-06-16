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
                :disabled="$isDisabled"
                inline-suffix
                x-bind:class="{
            '[&_.fi-input-wrp-suffix]:hidden': ! state
        }">
            <x-slot:prefix>
                <div x-show="isLoading && !selectedIcon">{{generate_loading_indicator_html()}}</div>
                <div x-html="selectedIcon"></div>
            </x-slot:prefix>
            @if($isDropdown && !$isDisabled)
                <x-filament::dropdown width="md" placement="bottom-start">
                    <x-slot:trigger>
                        <x-filament::input readonly x-model="state"/>
                    </x-slot:trigger>

                    <div class="p-2">

                        <x-guava-icon-picker::search :field="$field"
                                                     :sets="$getSets()"
                                                     :search-prompt="$getSearchPrompt()"
                        />
                    </div>
                </x-filament::dropdown>
            @else
                <x-filament::input readonly x-model="state"/>
            @endif
            @if(!$isDisabled)
                <x-slot:suffix>
                    <button class="opacity-50 bg-no-repeat bg-center dark:invert" @style([
                        "width: 10px; height: 10px",
                        "background-size: 0.7142em 0.7142em;",
                        "background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEiIGhlaWdodD0iMjEiIHZpZXdCb3g9IjAgMCAyMSAyMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yLjU5Mi4wNDRsMTguMzY0IDE4LjM2NC0yLjU0OCAyLjU0OEwuMDQ0IDIuNTkyeiIvPjxwYXRoIGQ9Ik0wIDE4LjM2NEwxOC4zNjQgMGwyLjU0OCAyLjU0OEwyLjU0OCAyMC45MTJ6Ii8+PC9nPjwvc3ZnPg==')"
                        ]) x-on:click.prevent="updateState(null)"></button>
                </x-slot:suffix>
            @endif
        </x-filament::input.wrapper>

        @if(!$isDropdown && !$isDisabled)
            <x-filament::section compact>
                <x-guava-icon-picker::search :field="$field"
                                             :sets="$getSets()"
                                             :search-prompt="$getSearchPrompt()"
                />
            </x-filament::section>
        @endif
    </div>
</x-dynamic-component>
