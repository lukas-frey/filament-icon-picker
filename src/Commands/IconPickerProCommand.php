<?php

namespace Guava\IconPickerPro\Commands;

use Illuminate\Console\Command;

class IconPickerProCommand extends Command
{
    public $signature = 'filament-icon-picker-pro';

    public $description = 'My command';

    public function handle(): int
    {
        $this->comment('All done');

        return self::SUCCESS;
    }
}
