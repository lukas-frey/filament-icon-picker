<?php

namespace Guava\IconPickerPro\Actions;

use Closure;
use Filament\Actions\Action;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Guava\IconPickerPro\Forms\Components\IconPicker;
use Guava\IconPickerPro\Icons\Facades\IconManager;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Stringable;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class UploadCustomIcon extends Action
{
    public static function getDefaultName(): ?string
    {
        return 'upload-custom-icon';
    }

    public function configure(): static
    {
        return $this
            ->label(__('filament-icon-picker-pro::actions.upload-custom-icon.label'))
            ->icon('heroicon-c-arrow-up-tray')
            ->modal()
            ->modalIcon(fn (UploadCustomIcon $action) => $action->getIcon())
            ->schema(fn (IconPicker $component) => [
                FileUpload::make('file')
                    ->label(__('filament-icon-picker-pro::actions.upload-custom-icon.schema.file.label'))
                    ->acceptedFileTypes(['image/svg+xml'])
                    ->disk('public')
                    ->directory(function () use ($component): string {
                        $directory = str('icon-picker-pro-icons');

                        if ($model = $component->getScopedTo()) {
                            $scopeId = md5("{$model->getMorphClass()}::{$model->getKey()}");
                            $directory = $directory->append(DIRECTORY_SEPARATOR, $scopeId);
                        } else {
                            $directory = $directory->append(DIRECTORY_SEPARATOR, 'unscoped');
                        }

                        return $directory;
                    })
                    ->getUploadedFileNameForStorageUsing(
                        fn (TemporaryUploadedFile $file, Get $get): string => str($get('label'))
                            ->lower()
                            ->kebab()
                            ->append('.svg')
                    )
                    ->required(),

                TextInput::make('label')
                    ->label(__('filament-icon-picker-pro::actions.upload-custom-icon.schema.label.label'))
                    ->extraAlpineAttributes([
                        'x-on:input' => '$event.target.value = $event.target.value.replace(/[^a-zA-Z0-9\s]/g, \'\')',
                    ])
                    ->rules([
                        fn (): Closure => function (string $attribute, $value, Closure $fail) use ($component) {
                            $id = $this->getBladeIconId($value, $component->getScopedTo());
                            if (IconManager::getIcon($id)) {
                                $fail(__('filament-icon-picker-pro::validation.icon-already-exists'));
                            }
                        },
                    ])
                    ->required(),
            ])
            ->after(function (array $data, IconPicker $component): void {
                $component->state($this->getBladeIconId(
                    data_get($data, 'label'),
                    $component->getScopedTo()
                ));
                $component->callAfterCustomIconUploaded();
            })
        ;
    }

    protected function getBladeIconId(string $label, ?Model $scope): string
    {
        return str($label)
            ->lower()
            ->kebab()
            ->when(
                $scope,
                function (Stringable $string) use ($scope) {
                    $scopeId = md5("{$scope->getMorphClass()}::{$scope->getKey()}");

                    return $string->prepend("$scopeId.");
                },
                fn (Stringable $string) => $string->prepend('unscoped.')
            )
            ->prepend('_ipp_icons-')
        ;
    }
}
