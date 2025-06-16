<?php

namespace Guava\IconPickerPro\Validation;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Model;

class VerifyIconScope implements ValidationRule
{
    public function __construct(
        private Model $scopedTo,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $prefix = str($value)->before('-');
        $scope = str($value)->after('-')->before('.')->toString();

        // TODO: replace magic value
        if ($prefix !== '_ipp_icons') {
            return;
        }

        if (! empty($scope)) {
            if ($this->getScopeId($this->scopedTo) !== $scope) {
                $fail('Unauthorized icon scope.');
            }
        }
    }

    private function getScopeId(Model $model): string
    {
        return md5("{$model->getMorphClass()}::{$model->getKey()}");
    }
}
