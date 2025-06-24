<?php

namespace Guava\IconPickerPro\Icons;

class Icon
{
    public string $label;

    public function __construct(
        public string $id,
        public string $name,
        protected IconSet $set,
    ) {
        $this->label = str($this->name)->afterLast('.')->headline()->lower()->ucfirst();
    }

    public function getSet(): IconSet
    {
        return $this->set;
    }
}
