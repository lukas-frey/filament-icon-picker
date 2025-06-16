<?php

namespace Guava\IconPickerPro\Forms\Components;

use Filament\Forms\Components\Concerns\CanBeSearchable;
use Filament\Forms\Components\Field;
use Filament\Support\Components\Attributes\ExposedLivewireMethod;
use Guava\IconPickerPro\Actions\UploadCustomIcon;
use Guava\IconPickerPro\Forms\Components\Concerns\CanBeScopedToModel;
use Guava\IconPickerPro\Forms\Components\Concerns\CanUploadCustomIcons;
use Guava\IconPickerPro\Forms\Components\Concerns\CanUseDropdown;
use Guava\IconPickerPro\Forms\Components\Concerns\HasSearchResultsView;
use Guava\IconPickerPro\Icons\Facades\IconManager;
use Guava\IconPickerPro\Icons\IconSet;
use Illuminate\Support\Collection;
use Livewire\Attributes\Renderless;

class IconPicker extends Field
{
    use CanBeScopedToModel;
    use CanBeSearchable;
    use CanUploadCustomIcons;
    use CanUseDropdown;
    use HasSearchResultsView;

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

    #[ExposedLivewireMethod]
    #[Renderless]
    public function getSetJs(?string $state = null): ?string
    {
        if ($state) {
            return IconManager::getSetFromIcon($state)->getId();
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
}
