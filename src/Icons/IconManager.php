<?php

namespace Guava\IconPickerPro\Icons;

use BladeUI\Icons\Factory as IconFactory;
use Illuminate\Support\Collection;

class IconManager
{
    public function __construct(
        private IconFactory $factory,
    ) {}

    public function getSets(): Collection
    {
        return collect($this->factory->all())
            ->map(static fn (array $configuration, string $id) => IconSet::createFromArray($configuration, $id));
    }
    public function getSetByPrefix(string $prefix): ?IconSet
    {
        return collect($this->getSets())->where(fn(IconSet $set) => $set->getPrefix() === $prefix)->first();
    }
    public function getSetFromIcon(string $id): ?IconSet
    {
        $prefix = str($id)->before('-');
        return $this->getSetByPrefix($prefix);
    }
}
