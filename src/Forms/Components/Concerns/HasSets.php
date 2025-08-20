<?php

namespace Guava\IconPicker\Forms\Components\Concerns;

use Closure;
use Guava\IconPicker\Icons\Facades\IconManager;
use Guava\IconPicker\Icons\IconSet;
use Illuminate\Support\Collection;

trait HasSets
{
    protected null | Closure | array $sets = null;

    public function sets(Closure | array $sets): static
    {
        $this->sets = $sets;

        return $this;
    }

    public function getSets(): ?array
    {
        return $this->evaluate($this->sets);
    }

    public function getAllowedSets(): Collection
    {
        return IconManager::getSets()
            ->when(
                ! $this->isCustomIconsUploadEnabled(),
                fn (Collection $items) => $items->filter(fn (IconSet $set) => ! $set->custom)
            )
            ->when(
                $allowedSets = $this->getSets(),
                fn (Collection $items) => $items->filter(fn (IconSet $set) => in_array($set->getId(), $allowedSets))
            )
        ;
    }
}
