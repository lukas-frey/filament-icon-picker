<?php

namespace Guava\IconPickerPro\Tables\Columns;

use Closure;
use Filament\Support\Components\Contracts\HasEmbeddedView;
use Filament\Support\Enums\Alignment;
use Filament\Support\Enums\IconSize;
use Filament\Tables\Columns\Column;
use Filament\Tables\Columns\Concerns\HasColor;
use Filament\Tables\View\Components\Columns\IconColumnComponent\IconComponent;
use Illuminate\Support\Js;
use Illuminate\View\ComponentAttributeBag;

use function Filament\Support\generate_icon_html;

class IconColumn extends Column implements HasEmbeddedView
{
    use HasColor;

    protected IconSize | string | Closure | null $size = null;

    public function size(IconSize | string | Closure | null $size): static
    {
        $this->size = $size;

        return $this;
    }

    public function getSize(mixed $state): IconSize | string | null
    {
        $size = $this->evaluate($this->size, [
            'state' => $state,
        ]);

        if (blank($size)) {
            return null;
        }

        if ($size === 'base') {
            return null;
        }

        if (is_string($size)) {
            $size = IconSize::tryFrom($size) ?? $size;
        }

        return $size;
    }

    public function toEmbeddedHtml(): string
    {
        $state = $this->getState();
        $color = $this->getColor($state);
        $size = $this->getSize($state);

        $attributes = $this->getExtraAttributeBag()
            ->class([
                'fi-ta-icon',
                'fi-inline' => $this->isInline(),
            ])
        ;

        $alignment = $this->getAlignment();

        $attributes = $attributes
            ->class([
                ($alignment instanceof Alignment) ? "fi-align-{$alignment->value}" : (is_string($alignment) ? $alignment : ''),
            ])
        ;

        ob_start(); ?>

        <div <?= $attributes->toHtml() ?>>
            <?= generate_icon_html($state, attributes: (new ComponentAttributeBag)
                ->merge([
                    'x-tooltip' => filled($tooltip = $this->getTooltip($state))
                        ? '{
                                content: ' . Js::from($tooltip) . ',
                                theme: $store.theme,
                            }'
                        : null,
                ], escape: false)
                ->color(IconComponent::class, $color), size: $size ?? IconSize::Large)
                ->toHtml() ?>
        </div>

        <?php return ob_get_clean();
    }
}
