<?php

namespace Guava\IconPickerPro\Forms\Components\Concerns;

use Closure;

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
}
