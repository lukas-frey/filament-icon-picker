<?php

namespace Guava\IconPicker\Forms\Components\Concerns;

use Closure;

trait CanUseDropdown
{
    protected Closure | bool $dropdown = true;

    public function dropdown(Closure | bool $condition = true): static
    {
        $this->dropdown = $condition;

        return $this;
    }

    public function isDropdown(): bool
    {
        return $this->evaluate($this->dropdown);
    }
}
