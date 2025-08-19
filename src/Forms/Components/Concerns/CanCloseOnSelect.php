<?php

namespace Guava\IconPicker\Forms\Components\Concerns;

use Closure;
use Guava\IconPicker\Validation\VerifyIconScope;
use Illuminate\Database\Eloquent\Model;

trait CanCloseOnSelect
{
    protected Closure | bool $closeOnSelect = false;

    public function closeOnSelect(Closure | bool $condition = true): static
    {
        $this->closeOnSelect = $condition;

        return $this;
    }

    public function shouldCloseOnSelect(): bool
    {
        return $this->evaluate($this->closeOnSelect);
    }
}
