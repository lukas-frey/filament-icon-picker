<?php

namespace Guava\IconPickerPro\Forms\Components\Concerns;

use Closure;
use Guava\IconPickerPro\Actions\UploadCustomIcon;

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
}
