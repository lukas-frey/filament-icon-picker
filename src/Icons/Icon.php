<?php

namespace Guava\IconPicker\Icons;

class Icon
{
    public string $label;

    public bool $custom = false;

    public function __construct(
        public string $id,
        public string $name,
        protected IconSet $set,
    ) {
        $this->label = str($this->name)->afterLast('.')->headline()->lower()->ucfirst();
        $this->custom = $this->set->custom;
    }

    public function getSet(): IconSet
    {
        return $this->set;
    }
}
