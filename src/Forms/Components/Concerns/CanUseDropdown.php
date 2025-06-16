<?php

namespace Guava\IconPickerPro\Forms\Components\Concerns;

use Closure;
use Guava\IconPickerPro\Validation\VerifyIconScope;
use Illuminate\Database\Eloquent\Model;

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
