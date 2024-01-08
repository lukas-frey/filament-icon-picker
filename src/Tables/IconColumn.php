<?php

namespace Guava\FilamentIconPicker\Tables;

use Closure;
use Filament\Tables\Columns\Column;

class IconColumn extends Column
{
    protected string $view = 'filament-icon-picker::tables.icon-column';
    protected bool | Closure $hideIcon = false;
    protected null | string | Closure $useIcon = null;

    public function useIcon(null | string | Closure $icon): static
    {
        $this->useIcon = $icon;

        return $this;
    }

    public function hideIcon(bool | Closure $condition = true): static
    {
        $this->hideIcon = $condition;

        return $this;
    }

    public function toHideIcon(): bool
    {
        if ($this->evaluate($this->hideIcon)) {
            return true;
        }

        return ! $this->hasIconValue();
    }

    public function getIcon(): string
    {
        if ($this->useIcon) {
            return strval($this->evaluate($this->useIcon));
        }

        return strval($this->getState());
    }

    public function hasIconValue(): bool
    {
        return filled($this->getIcon());
    }
}
