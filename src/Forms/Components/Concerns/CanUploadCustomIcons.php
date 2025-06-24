<?php

namespace Guava\IconPickerPro\Forms\Components\Concerns;

use Closure;
use Guava\IconPickerPro\Actions\UploadCustomIcon;
use Guava\IconPickerPro\Icons\Icon;

trait CanUploadCustomIcons
{
    protected Closure | bool $customIconsUploadEnabled = false;

    public function customIconsUploadEnabled(Closure | bool $condition = true): static
    {
        $this->customIconsUploadEnabled = $condition;

        return $this;
    }

    public function isCustomIconsUploadEnabled(): ?bool
    {
        return $this->evaluate($this->customIconsUploadEnabled);
    }

    public function getCustomIconsUploadAction(): UploadCustomIcon
    {
        return UploadCustomIcon::make()
            ->disabled($this->isDisabled())
        ;
    }

    public function callAfterCustomIconUploaded(): void
    {
        if ($state = $this->getState()) {
            if ($icon = $this->getIconsJs()->first(fn (Icon $icon) => $icon->id === $state)) {
                $this->getLivewire()->dispatch(
                    "custom-icon-uploaded::{$this->getKey()}",
                    id: $icon->id,
                    label: $icon->label,
                    set: $icon->getSet()->getId()
                );
            }
        }
    }
}
