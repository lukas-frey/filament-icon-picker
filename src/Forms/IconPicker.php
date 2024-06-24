<?php

namespace Guava\FilamentIconPicker\Forms;


use BladeUI\Icons\Factory as IconFactory;
use Closure;
use Filament\Forms\Components\Select;
use Guava\FilamentIconPicker\Forms\Concerns\CanBeCacheable;
use Guava\FilamentIconPicker\Layout;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Illuminate\View\View;
use Symfony\Component\Finder\SplFileInfo;

class IconPicker extends Select
{
    use CanBeCacheable;

    protected string $view = 'filament-icon-picker::forms.icon-picker';

    protected array|Closure|null $sets = null;
    protected array|Closure|null $allowedIcons = null;
    protected array|Closure|null $disallowedIcons = null;

    protected bool|Closure $isHtmlAllowed = true;
    protected bool|Closure $isSearchable = true;

    protected Closure|string|Htmlable|null $itemTemplate = null;

    protected string $layout = Layout::FLOATING;

    protected bool|Closure $show;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sets(config('icon-picker.sets', null));
        $this->columns(config('icon-picker.columns', 1));
        $this->layout(config('icon-picker.layout', Layout::FLOATING));

        $this->getSearchResultsUsing = function (IconPicker $component, string $search, Collection $icons) {

            $iconsHash = md5(serialize($icons));
            $key = "icon-picker.results.$iconsHash.$search";

            return $this->tryCache($key, function () use ($component, $search, $icons) {
                return collect($icons)
                    ->filter(fn(string $icon) => str_contains($icon, $search))
                    ->mapWithKeys(function (string $icon) use ($component) {
                        return [$icon => $component->getItemTemplate(['icon' => $icon])];
                    })
                    ->toArray();
            });
        };

        $this->getOptionLabelUsing = function (IconPicker $component, $value) {
            if ($value) {
                return $component->getItemTemplate(['icon' => $value]);
            }
        };

        $this
            ->itemTemplate(function (IconPicker $component, string $icon) {
                return \view('filament-icon-picker::item', [
                    'icon' => $icon,
                ])->render();
            })
            ->placeholder(function () {
                return $this->view('filament-icon-picker::placeholder')->render();
            });
    }

    /**
     * @param array|string|Closure|null $sets
     * @return $this
     */
    public function sets(array|Closure|string|null $sets = null): static
    {
        $this->sets = $sets ? (is_string($sets) ? [$sets] : $sets) : null;

        return $this;
    }

    public function getSets(): ?array
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

    public function layout(string|Closure $layout): static
    {
        $this->layout = $layout;

        return $this;
    }

    public function getLayout(): string
    {
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

    /**
     * Enact the preload logic (if, and only if, the user wants to preload the icons)
     */
    protected function doPreload(): void
    {
        if (!$this->isPreloaded()) {
            return;
        }

        // To actually preload the icons, we trigger a search on the empty string.
        // `str_contains` will return true for any haystack if the needle is the empty string.
        // This is exactly how we know we get all the icons AND respect the user-land
        // configuration applied to this field instance.
        $options = $this->getSearchResults('');

        // To avoid recursively and needlessly loading the icons each time
        // anything requests the options or uses the `doPreload` method,
        // we set the `preload` option to false right before setting the
        // resolved/computed icons.
        $this->preload(false);

        // We delegate back to the parent's `options` method as a setter
        // to keep our own as a throwing-method in user-land.
        // This sets the icons on the back-end and front-end.
        // It also make it work as soon as the component is mounted,
        // which means there's no need for user interaction to get the
        // full list of options loaded directly.
        parent::options($options);
    }

    public function getOptions(): array
    {
        $this->doPreload();
        return parent::getOptions();
    }

    public function relationship(string|Closure|null $name = null, string|Closure|null $titleAttribute = null, ?Closure $modifyQueryUsing = null, bool $ignoreRecord = false): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    public function options(Arrayable|Closure|array|string|null $options): static
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

    public function createOptionUsing(?Closure $callback): static
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

    public function multiple(bool|Closure $condition = true): static
    {
        throw new \BadMethodCallException('Method not allowed.');
    }

    private function loadIcons(): Collection
    {
        $iconsHash = md5(serialize($this->getSets()));
        $key = "icon-picker.fields.{$iconsHash}.{$this->getStatePath()}";

        [$sets, $allowedIcons, $disallowedIcons] = $this->tryCache(
            $key,
            function () {
                $allowedIcons = $this->getAllowedIcons();
                $disallowedIcons = $this->getDisallowedIcons();

                $iconsFactory = App::make(IconFactory::class);
                $allowedSets = $this->getSets();
                $sets = collect($iconsFactory->all());

                if ($allowedSets) {
                    $sets = $sets->filter(fn($value, $key) => in_array($key, $allowedSets));
                }

                return [$sets, $allowedIcons, $disallowedIcons];
            });


        $allowedSetsHash = md5(serialize($sets));
        $allowedHash = md5(serialize($allowedIcons));
        $disallowedHash = md5(serialize($disallowedIcons));
        $iconsKey = "icon-picker.fields.icons.{$iconsHash}.{$allowedSetsHash}.{$allowedHash}.{$disallowedHash}.{$this->getStatePath()}";
        
        $icons = $this->tryCache($iconsKey, function() use($sets, $allowedIcons, $disallowedIcons) {
            $icons = [];

            foreach ($sets as $set) {
                $prefix = $set['prefix'];
                foreach ($set['paths'] as $path) {
                    // To include icons from sub-folders, we use File::allFiles instead of File::files
                    // See https://github.com/blade-ui-kit/blade-icons/blob/ce60487deeb7bcbccd5e69188dc91b4c29622aff/src/IconsManifest.php#L40
                    foreach (File::allFiles($path) as $file) {
                        // Simply ignore files that aren't SVGs
                        if ($file->getExtension() !== 'svg') {
                            continue;
                        }

                        $iconName = $this->getIconName($file, parentPath: $path, prefix: $prefix);

                        if ($allowedIcons && !in_array($iconName, $allowedIcons)) {
                            continue;
                        }
                        if ($disallowedIcons && in_array($iconName, $disallowedIcons)) {
                            continue;
                        }

                        $icons[] = $iconName;
                    }
                }
            }

            return $icons;
        });

        return collect($icons);
    }

    /**
     * @see https://github.com/blade-ui-kit/blade-icons and its IconsManifest.php
     * @see https://github.com/blade-ui-kit/blade-icons/blob/ce60487deeb7bcbccd5e69188dc91b4c29622aff/src/IconsManifest.php#L78
     */
    private function getIconName(SplFileInfo $file, string $parentPath, string $prefix): string {
        // BladeIcons uses a simple (and view-compliant) naming convention for icon names
        // `xtra-icon` is the `icon.svg` from the `xtra` icon set
        // `xtra-dir.icon` is the `icon.svg` from the `dir/` folder from the `xtra` icon set
        // `xtra-sub.dir.icon` is the `icon.svg` from the `sub/dir/` folder from the `xtra` icon set
        //
        // As such, we:
        // - get the string after the parent directory's path
        // - replace every directory separator by a dot
        // - add the prefix at the beginning, followed by a dash

        $iconName = str($file->getPathname())
            ->after($parentPath . DIRECTORY_SEPARATOR)
            ->replace(DIRECTORY_SEPARATOR, '.')
            ->basename('.svg')
            ->toString();

        return "$prefix-$iconName";
    }
}
