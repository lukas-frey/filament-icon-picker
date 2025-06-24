<?php

namespace Guava\IconPickerPro\Actions;

use Filament\Actions\Action;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Utilities\Get;
use Guava\IconPickerPro\Forms\Components\IconPicker;
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
                    ->lazy()
                    ->helperText(fn (?string $state) => 'ID: ' . str($state)->lower()->kebab())
                    ->required(),
            ])
            ->after(function (array $data, IconPicker $component): void {
                $id = str(data_get($data, 'label'))
                    ->lower()
                    ->kebab()
                    ->when(
                        $scope = $component->getScopedTo(),
                        function (Stringable $string) use ($scope) {
                            $scopeId = md5("{$scope->getMorphClass()}::{$scope->getKey()}");

                            return $string->prepend("$scopeId.");
                        },
                        fn (Stringable $string) => $string->prepend('unscoped.')
                    )
                    ->prepend('_ipp_icons-')
                ;

                $component->state($id->toString());
            })
//            ->action($this->handleAction(...))
        ;
    }

    //    protected function handleAction() {}
}
