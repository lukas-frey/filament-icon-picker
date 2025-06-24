<?php

namespace Guava\IconPickerPro\Forms\Components;

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
        return IconManager::getSets()
            ->when(
                ! $this->isCustomIconsUploadEnabled(),
                fn (Collection $sets) => $sets->filter(fn (IconSet $set) => ! $set->custom)
            )
        ;
    }

    public function getState(): mixed
    {
        return $this->verifyState(
            parent::getState()
        );
    }

    public function getDisplayName(): ?string
    {
        if ($state = $this->getState()) {
            if ($icon = IconManager::getIcon($state)) {
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
        return IconManager::getIcons($set, $this->getScopedTo());
    }

    #[ExposedLivewireMethod]
    #[Renderless]
    public function getIconSvgJs(?string $id): ?string
    {
        if (IconManager::getIcon($id, false)) {
            return generate_icon_html($id)?->toHtml();
        }

        if ($id === '_ipp_icons-f01b37a48c0c4decf31089f5b5382e23.test') {
            dd(IconManager::getIcon($id));
        }

        return null;
    }

    #[ExposedLivewireMethod]
    #[Renderless]
    public function verifyState(?string $state): ?string
    {
        if ($state && ! IconManager::getIcon($state)) {
            return null;
        }

        return $state;
    }
}
