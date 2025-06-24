<?php

namespace Guava\IconPickerPro\Forms\Components\Concerns;

use Closure;
use Guava\IconPickerPro\Validation\VerifyIconScope;
use Illuminate\Database\Eloquent\Model;

trait CanBeScopedToModel
{
    protected Closure | Model | null $scopedTo = null;

    public function scopedTo(Closure | Model | null $record): static
    {
        $this->scopedTo = $record;

        return $this;
    }

    public function getScopedTo(): ?Model
    {
        return $this->evaluate($this->scopedTo);
    }
}
