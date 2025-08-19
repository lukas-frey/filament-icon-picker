<?php

namespace Guava\IconPicker\Icons;

use BladeUI\Icons\Factory as IconFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class IconManager
{
    public function __construct(
        private IconFactory $factory,
    ) {}

    public function getSets(): Collection
    {
        return collect($this->factory->all())
            ->map(static fn (array $configuration, string $id) => IconSet::createFromArray($configuration, $id))
        ;
    }

    public function getIcons(null | string | IconSet $set = null, ?Model $scope = null, bool $checkScope = true): Collection
    {
        if ($set instanceof IconSet) {
            $set = $set->getId();
        }

        return $this->getSets()
            ->when(
                $set,
                fn (Collection $sets) => $sets->filter(fn (IconSet $iconSet) => $iconSet->getId() === $set)
            )
            ->map(fn (IconSet $is) => $is->getIcons($scope, $checkScope))
            ->collapse()
        ;
    }

    public function getSetByPrefix(string $prefix): ?IconSet
    {
        return collect($this->getSets())->where(fn (IconSet $set) => $set->getPrefix() === $prefix)->first();
    }

    public function getSetFromIcon(string $id): ?IconSet
    {
        $prefix = str($id)->before('-');

        return $this->getSetByPrefix($prefix);
    }

    public function getIcon(?string $id, bool $checkScope = false): ?Icon
    {
        return $this->getIcons(checkScope: $checkScope)->first(fn (Icon $icon) => $icon->id === $id);
    }
}
