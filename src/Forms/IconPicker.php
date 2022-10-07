<?php

namespace Guava\FilamentIconPicker\Forms;


use BladeUI\Icons\Factory as IconFactory;
use Closure;
use Filament\Forms\Components\Select;
use Guava\FilamentIconPicker\Layout;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Illuminate\View\View;

class IconPicker extends Select
{

    protected string $view = 'filament-icon-picker::forms.icon-picker';

    protected array|Closure|null $sets = ['heroicons'];
    protected array|Closure|null $allowedIcons = null;
    protected array|Closure|null $disallowedIcons = null;

    protected bool|Closure $isHtmlAllowed = true;
    protected bool|Closure $isSearchable = true;

    protected Closure|string|Htmlable|null $itemTemplate = null;

    protected Layout $layout = Layout::FLOATING;

    protected bool|Closure $show;

    protected function setUp(): void
    {
        parent::setUp();

        $this->getSearchResultsUsing = function (IconPicker $component, string $search, Collection $icons) {
            return collect($icons)
                ->filter(fn(string $icon) => str_contains($icon, $search))
                ->mapWithKeys(function (string $icon) use ($component) {
                    return [$icon => $component->getItemTemplate(['icon' => $icon])];
                })
                ->toArray();
        };

        $this
            ->itemTemplate(fn(string $icon) => \view('filament-icon-picker::item', ['icon' => $icon])->render())
            ->placeholder(function () {
                return $this->view('filament-icon-picker::placeholder')->render();
            });
    }

    /**
     * @param array|string|Closure|null $sets
     * @return $this
     */
    public function sets(array|Closure|string|null $sets): static
    {
        $this->sets = is_array($sets) ? $sets : [$sets];

        return $this;
    }

    public function getSets(): array
    {
        return $this->evaluate($this->sets);
    }

    public function allowedIcons(array|Closure|string $allowedIcons): static
    {
        $this->allowedIcons = $allowedIcons;

        return $this;
    }

    public function getAllowedIcons(): ?array
    {
        return $this->evaluate($this->allowedIcons, [
            'sets' => $this->getSets(),
        ]);
    }

    public function disallowedIcons(array|Closure|string $disallowedIcons): static
    {
        $this->disallowedIcons = $disallowedIcons;

        return $this;
    }

    public function getDisallowedIcons(): ?array
    {
        return $this->evaluate($this->disallowedIcons, [
            'sets' => $this->getSets(),
        ]);
    }

    public function layout(Layout | Closure $layout): static
    {
        $this->layout = $layout;

        return $this;
    }

    public function getLayout(): Layout {
        return $this->evaluate($this->layout);
    }

    public function itemTemplate(Htmlable|Closure|View $template): static
    {
        $this->itemTemplate = $template;

        return $this;
    }

    public function getItemTemplate(array $options = []): string
    {
        return $this->evaluate($this->itemTemplate, $options);
    }

    public function getSearchResults(string $search): array
    {
        if (!$this->getSearchResultsUsing) {
            return [];
        }

        $results = $this->evaluate($this->getSearchResultsUsing, [
            'query' => $search,
            'search' => $search,
            'searchQuery' => $search,
            'icons' => $this->loadIcons(),
        ]);

        if ($results instanceof Arrayable) {
            $results = $results->toArray();
        }

        return $results;
    }

    public function relationship(Closure|string $relationshipName, Closure|string $titleColumnName, ?Closure $callback = null): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    public function options(array|Closure|string|Arrayable $options): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    public function allowHtml(bool|Closure $condition = true): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    public function searchable(bool|array|Closure $condition = true): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    public function getSearchResultsUsing(?Closure $callback): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    public function getOptionLabelFromRecordUsing(?Closure $callback): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    public function createOptionUsing(Closure $callback): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    public function createOptionAction(?Closure $callback): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    public function createOptionForm(array|Closure|null $schema): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    public function schema(array|Closure $components): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    private function loadIcons(): Collection
    {
        $iconsFactory = App::make(IconFactory::class);
        $sets = collect($iconsFactory->all())
            ->filter(fn($value, $key) => in_array($key, $this->getSets()));

        $icons = [];

        $allowedIcons = $this->getAllowedIcons();
        $disallowedIcons = $this->getDisallowedIcons();

        foreach ($sets as $set) {
            $prefix = $set['prefix'];
            foreach ($set['paths'] as $path) {
                foreach (File::files($path) as $file) {
                    $filename = $prefix . '-' . $file->getFilenameWithoutExtension();

                    if ($allowedIcons && !in_array($filename, $allowedIcons)) {
                        continue;
                    }
                    if ($disallowedIcons && in_array($filename, $disallowedIcons)) {
                        continue;
                    }

                    $icons[] = $filename;
                }
            }
        }

        return collect($icons);
    }
}
