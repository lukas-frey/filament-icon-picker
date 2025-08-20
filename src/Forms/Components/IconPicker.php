<?php

namespace Guava\IconPicker\Forms\Components;

use Filament\Forms\Components\Concerns\CanBeSearchable;
use Filament\Forms\Components\Field;
use Filament\Support\Components\Attributes\ExposedLivewireMethod;
use Filament\Support\Concerns\HasPlaceholder;
use Guava\IconPicker\Actions\UploadCustomIcon;
use Guava\IconPicker\Forms\Components\Concerns\CanBeScopedToModel;
use Guava\IconPicker\Forms\Components\Concerns\CanCloseOnSelect;
use Guava\IconPicker\Forms\Components\Concerns\CanUploadCustomIcons;
use Guava\IconPicker\Forms\Components\Concerns\CanUseDropdown;
use Guava\IconPicker\Forms\Components\Concerns\HasSearchResultsView;
use Guava\IconPicker\Forms\Components\Concerns\HasSets;
use Guava\IconPicker\Icons\Facades\IconManager;
use Guava\IconPicker\Validation\VerifyIcon;
use Guava\IconPicker\Validation\VerifyIconScope;
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
    use HasSets;

    protected string $view = 'guava-icon-picker::forms.components.icon-picker';

    protected function setUp(): void
    {
        parent::setUp();

        $this
            ->placeholder(__('filament-icon-picker::icon-picker.placeholder'))
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
