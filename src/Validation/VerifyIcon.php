<?php

namespace Guava\IconPickerPro\Validation;

use BladeUI\Icons\Exceptions\SvgNotFound;
use BladeUI\Icons\Factory as IconFactory;
use Closure;
use Guava\IconPickerPro\Forms\Components\IconPicker;
use Guava\IconPickerPro\Icons\Facades\IconManager;
use Illuminate\Contracts\Validation\ValidationRule;

class VerifyIcon implements ValidationRule
{
    protected IconFactory $iconFactory;
    public function __construct(protected IconPicker $iconPicker) {
        $this->iconFactory = app(IconFactory::class);
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Check if icon exists
        if (! IconManager::getIcon($value)) {
            $fail('Icon does not exist.');
        }
    }
}
