<?php

namespace Guava\IconPickerPro\Forms\Components\Concerns;

use Closure;
use Illuminate\Contracts\View\View;

trait HasSearchResultsView
{
    protected Closure | string $searchResultsView = 'guava-icon-picker::search-results.grid';

    protected Closure | array | null $searchResultsViewData = null;

    public function gridSearchResults(): static
    {
        return $this->searchResultsView('guava-icon-picker::search-results.grid');
    }

    public function listSearchResults(): static
    {
        return $this->searchResultsView('guava-icon-picker::search-results.list');
    }

    public function iconsSearchResults(bool $withTooltips = true): static
    {
        return $this->searchResultsView('guava-icon-picker::search-results.icons', [
            'withTooltips' => $withTooltips,
        ]);
    }

    public function searchResultsView(Closure | string | View $view, Closure | array | null $viewData = null): static
    {
        $this->searchResultsView = $view;

        if ($viewData) {
            $this->searchResultsViewData($viewData);
        }

        return $this;
    }

    public function getSearchResultsView(): string
    {
        return $this->evaluate($this->searchResultsView);
    }

    public function searchResultsViewData(Closure | array $viewData): static
    {
        $this->searchResultsViewData = $viewData;

        return $this;
    }

    public function getSearchResultsViewData(): array
    {
        $viewData = $this->evaluate($this->searchResultsViewData) ?? [];

        return [
            ...$viewData,
            ...$this->getDefaultSearchResultsViewData(),
        ];
    }

    public function getSearchResultsViewComponent(): View
    {
        return view(
            $this->getSearchResultsView(),
            $this->getSearchResultsViewData()
        );
    }

    protected function getDefaultSearchResultsViewData(): array
    {
        return [
            'searchingMessage' => $this->getSearchingMessage(),
            'field' => $this,
        ];
    }
}
