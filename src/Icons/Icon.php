<?php

namespace Guava\IconPickerPro\Icons;

use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Str;
use function Filament\Support\generate_icon_html;

class Icon
{
//    public string $html;
    public string $label;

    public function __construct(
        public string $id,
        public string $name,
        protected IconSet $set,
    ) {
//        $this->html = generate_icon_html($this->id)->toHtml();
        $this->label = str($this->name)->headline()->lower()->ucfirst();
    }

}
