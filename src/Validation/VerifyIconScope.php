<?php

namespace Guava\IconPickerPro\Validation;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Model;

class VerifyIconScope implements ValidationRule
{
    public function __construct(
        private ?Model $scopedTo,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $prefix = str($value)->before('-')->toString();
        $scope = str($value)->after('-')->before('.')->toString();

        // TODO: replace magic value
        if ($prefix !== '_ipp_icons') {
            return;
        }

        // Custom icon without scope - should not be possible
        if (empty($scope)) {
            $fail('Scope missing for custom icon.');
        }

        if ($this->getScopeId($this->scopedTo) !== $scope) {
            $fail('Unauthorized icon scope.');
        }
    }

    private function getScopeId(?Model $model): string
    {
        if ($model === null) {
            return 'unscoped';
        }

        return md5("{$model->getMorphClass()}::{$model->getKey()}");
    }
}
