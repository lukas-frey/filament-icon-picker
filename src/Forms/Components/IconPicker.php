<?php

namespace Guava\IconPickerPro\Forms\Components;

use BladeUI\Icons\Exceptions\SvgNotFound;
use BladeUI\Icons\Factory as IconFactory;
use Filament\Forms\Components\Concerns\CanBeSearchable;
use Filament\Forms\Components\Field;
use Filament\Support\Components\Attributes\ExposedLivewireMethod;
use Filament\Support\Concerns\HasPlaceholder;
use Guava\IconPickerPro\Actions\UploadCustomIcon;
use Guava\IconPickerPro\Forms\Components\Concerns\CanBeScopedToModel;
use Guava\IconPickerPro\Forms\Components\Concerns\CanCloseOnSelect;
use Guava\IconPickerPro\Forms\Components\Concerns\CanUploadCustomIcons;
use Guava\IconPickerPro\Forms\Components\Concerns\CanUseDropdown;
use Guava\IconPickerPro\Forms\Components\Concerns\HasSearchResultsView;
use Guava\IconPickerPro\Icons\Facades\IconManager;
use Guava\IconPickerPro\Icons\Icon;
use Guava\IconPickerPro\Icons\IconSet;
use Guava\IconPickerPro\Validation\VerifyIcon;
use Guava\IconPickerPro\Validation\VerifyIconScope;
use Illuminate\Support\Collection;
use Livewire\Attributes\Renderless;

use function Filament\Support\generate_icon_html;

class IconPicker extends Field
{
    use CanBeScopedToModel;
    use CanBeSearchable;
    use CanCloseOnSelect;
    use CanUploadCustomIcons;
    use CanUseDropdown;
    use HasPlaceholder;
    use HasSearchResultsView;

    protected function setUp(): void
    {
        parent::setUp();

        $this
            ->placeholder(__('filament-icon-picker-pro::icon-picker.placeholder'))
            ->rules(
                fn (IconPicker $component) => collect([
                    new VerifyIcon($component),
                ])
                    ->when(
                        $scopedTo = $component->getScopedTo(),
                        fn (Collection $rules) => $rules->push(new VerifyIconScope($scopedTo)),
                    )
                    ->all()
            )
        ;
    }

    public function getHintActions(): array
    {
        if ($this->isCustomIconsUploadEnabled()) {
            return [
                UploadCustomIcon::make()
                    ->disabled($this->isDisabled()),
            ];
        }

        return parent::getHintActions();
    }

    protected string $view = 'guava-icon-picker::forms.components.icon-picker';

    public function getSets()
    {
        return IconManager::getSets();
    }

    public function getState(): mixed
    {
        try {
            $factory = app(IconFactory::class);
            $state = parent::getState();

            if ($state) {
                $factory->svg($state);
            }

            return $state;
        } catch (SvgNotFound $e) {
            return null;
        }
    }

    public function getDisplayName(): ?string
    {
        if ($state = $this->getState()) {
            if ($icon = $this->getIconsJs()->first(fn (Icon $icon) => $icon->id === $state)) {
                return $icon->label;
            }
        }

        return null;
    }

    #[ExposedLivewireMethod]
    #[Renderless]
    public function getSetJs(?string $state = null): ?string
    {
        if ($state) {
            return IconManager::getSetFromIcon($state)?->getId();
        }

        return null;
    }

    #[ExposedLivewireMethod]
    #[Renderless]
    public function getIconsJs(?string $set = null): Collection
    {
        return IconManager::getSets()
            ->when(
                $set,
                fn (Collection $sets) => $sets->filter(fn (IconSet $iconSet) => $iconSet->getId() === $set)
            )
            ->map(fn (IconSet $is) => $is->getIcons($this->getScopedTo()))
            ->collapse()
        ;
    }

    #[ExposedLivewireMethod]
    #[Renderless]
    public function getIconSvgJs(?string $id): ?string
    {
        try {
            return generate_icon_html($id)?->toHtml();
        } catch (SvgNotFound $e) {
            return null;
        }
    }
}
