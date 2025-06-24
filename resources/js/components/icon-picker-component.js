import Fuse from 'fuse.js';

export default function iconPickerComponent({
                                                key,
                                                state,
                                                // selectedIcon,
                                                displayName,
                                                isDropdown,
                                                shouldCloseOnSelect,
                                                getSetUsing,
                                                getIconsUsing,
                                                getIconSvgUsing,
                                                verifyStateUsing,
                                            }) {
    return {
        state,
        displayName,
        isDropdown,
        shouldCloseOnSelect,
        dropdownOpen: false,
        set: null,
        icons: [],
        search: '',
        // selectedIcon,

        fuse: null,
        results: [],
        resultsVisible: [],
        minimumItems: 300,
        resultsPerPage: 50,
        resultsIndex: 0,

        isLoading: false,

        async init() {
            await verifyStateUsing(this.state)
                .then(result => this.state = result)

            // this.updateSelectedIcon();
            await this.loadIcons()

            // this.$watch('state', () => this.updateSelectedIcon())
            this.$wire.on(`custom-icon-uploaded::${key}`, (icon) => {
                this.displayName = icon.label
                this.set = icon.set
                this.afterSetUpdated()
            })
        },

        deferLoadingState() {
            return setTimeout(() => this.isLoading = true, 150);
        },

        async loadIcons() {
            this.isLoading = true;
            // const isLoadingDeferId = this.deferLoadingState()
            return await getIconsUsing(this.set)
                .then((icons) => {
                    this.icons = icons;
                    this.createFuseObject()
                    this.resetSearchResults()
                    // clearTimeout(isLoadingDeferId)
                    this.isLoading = false;
                })
        },

        async loadSet() {
            this.isLoading = true;
            // const isLoadingDeferId = this.deferLoadingState()
            return await getSetUsing(this.state).then((set) => {
                this.set = set
                // clearTimeout(isLoadingDeferId)
                this.isLoading = false;
            })
        },

        afterStateUpdated() {
            // this.updateSelectedIcon()
        },

        afterSetUpdated() {
            this.loadIcons()
        },

        async updateSelectedIcon(reloadIfNotFound = true) {
            const found = this.icons.find(icon => icon.id === this.state);
            if (found) {
                // this.selectedIcon = found.html;
            } else if (reloadIfNotFound) {
                await this.loadSet()
                await this.loadIcons()
                await this.updateSelectedIcon(false)
            }
        },

        setElementIcon(element, id, after = null) {
            getIconSvgUsing(id)
                .then((svg) => element.innerHTML = svg)
                .finally(after)
        },

        createFuseObject() {
            const options = {
                includeScore: true,
                keys: ['id']
            }

            this.fuse = new Fuse(this.icons, options)
        },

        resetSearchResults() {
            this.resultsPerPage = 20;
            this.resultsIndex = 0;
            this.results = this.icons;
            this.resultsVisible = [];
            this.addSearchResultsChunk();
        },

        setSelect: {
            // self: this,
            async ['x-on:change'](event) {
                const value = event.target.value;
                this.set = value ? value : null;

                this.afterSetUpdated()
            }
        },

        searchInput: {
            ['x-on:input.debounce'](event) {
                const value = event.target.value
                const isLoadingDeferId = this.deferLoadingState()
                if (value.length) {
                    this.resultsVisible = [];
                    this.resultsIndex = 0;
                    this.results = this.fuse.search(value).map(result => result.item);
                    this.addSearchResultsChunk()
                } else {
                    this.resetSearchResults()
                }
                clearTimeout(isLoadingDeferId)
                this.isLoading = false;
            },
        },

        dropdownTrigger: {
            ['x-on:click.prevent']() {
                this.dropdownOpen = true;
            }
        },

        dropdownMenu: {
            ['x-show']() {
                return !this.isDropdown || this.dropdownOpen
            },
            ['x-on:click.outside']() {
                this.dropdownOpen = false;
            }
            // [x-show="dropdown" x-on:click.outside="dropdown = false"]
        },

        addSearchResultsChunk() {
            let endIndex = this.resultsIndex + this.resultsPerPage;
            if (endIndex < this.minimumItems) {
                endIndex = this.minimumItems;
            }
            this.resultsVisible.push(...this.results.slice(this.resultsIndex, endIndex));
            this.resultsIndex = endIndex;
        },

        updateState(icon) {
            if (icon) {
                this.state = icon.id;
                this.displayName = icon.label;
                // this.selectedIcon = icon.html;
                if (this.shouldCloseOnSelect) {
                    this.$nextTick(() => this.dropdownOpen = false);
                }
            } else {
                this.state = null;
                this.displayName = null;
                // this.selectedIcon = null;
            }
        }
    }
}
